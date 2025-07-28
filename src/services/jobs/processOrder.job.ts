import type { Job } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import type { Redis } from 'ioredis';

import { fetchListing } from '@services/integrationHelper';
import { defaultQueueConfig } from '@services/queues/config';
import { redisConnection } from '@services/redis';
import { getIntegrationSdk } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';

const queueName = 'processOrder';

export interface QueueInterface {
  orderId: any;
  title: any;
  amount: number;
}

interface ProcessOrderJobData {
  orderId: any;
  planId: any;
  memberOrders?: Record<string, any>;
  orderDay?: string;
  orderDays?: string[];
  planData?: Record<string, Record<string, any>>;
  currentUserId: string;
}

type AddToQueueData = Pick<ProcessOrderJobData, 'orderId' | 'currentUserId'> &
  Partial<ProcessOrderJobData>;

const ACQUIRE_LOCK_SCRIPT = `
  local key = KEYS[1]
  local token = ARGV[1]
  local ttl = tonumber(ARGV[2])
  local current = redis.call('GET', key)
  if current == false then
    redis.call('SET', key, token, 'PX', ttl)
    return 1
  elseif current == token then
    redis.call('PEXPIRE', key, ttl)
    return 1
  else
    return 0
  end
`;

const RELEASE_LOCK_SCRIPT = `
  local key = KEYS[1]
  local token = ARGV[1]
  local current = redis.call('GET', key)
  if current == token then
    return redis.call('DEL', key)
  else
    return 0
  end
`;

class DistributedLock {
  private redis: Redis;

  private lockKey: string;

  private token: string;

  private ttl: number;

  private retryDelay: number;

  private maxRetries: number;

  constructor(
    redis: Redis,
    resource: string,
    options: { ttl?: number; retryDelay?: number; maxRetries?: number } = {},
  ) {
    this.redis = redis;
    this.lockKey = `lock:${resource}`;
    this.token = `${Date.now()}-${Math.random()}`;
    this.ttl = options.ttl || 30000;
    this.retryDelay = options.retryDelay || 100;
    this.maxRetries = options.maxRetries || 50;
  }

  private async tryAcquireLock(attempts = 0): Promise<boolean> {
    const result = (await this.redis.eval(
      ACQUIRE_LOCK_SCRIPT,
      1,
      this.lockKey,
      this.token,
      this.ttl,
    )) as number;

    if (result === 1) return true;
    if (attempts >= this.maxRetries) return false;

    const delay = this.retryDelay * 1.5 ** Math.min(attempts, 10);
    await new Promise((res) => {
      setTimeout(res, delay);
    });

    return this.tryAcquireLock(attempts + 1);
  }

  async acquire(): Promise<boolean> {
    return this.tryAcquireLock();
  }

  async release(): Promise<boolean> {
    const result = (await this.redis.eval(
      RELEASE_LOCK_SCRIPT,
      1,
      this.lockKey,
      this.token,
    )) as number;

    return result === 1;
  }

  async extend(additionalTtl: number = this.ttl): Promise<boolean> {
    const result = (await this.redis.eval(
      ACQUIRE_LOCK_SCRIPT,
      1,
      this.lockKey,
      this.token,
      additionalTtl,
    )) as number;

    return result === 1;
  }
}

// Queue setup
const processOrderQueue = new Queue<AddToQueueData>(queueName, {
  connection: redisConnection,
  defaultJobOptions: {
    ...defaultQueueConfig,
    delay: 500,
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Worker definition
const worker = new Worker<ProcessOrderJobData>(
  queueName,
  async (job: Job<ProcessOrderJobData>) => {
    const {
      orderId,
      planId,
      memberOrders,
      orderDay,
      orderDays,
      planData,
      currentUserId,
    } = job.data;

    const sdk = getIntegrationSdk();
    const lock = new DistributedLock(
      redisConnection as Redis,
      `plan:${planId}`,
      {
        ttl: 30000,
        retryDelay: 100,
        maxRetries: 100,
      },
    );

    try {
      const lockAcquired = await lock.acquire();
      if (!lockAcquired) {
        console.error(`Failed to acquire lock for planId: ${planId}`);
        throw new Error(`Failed to acquire lock for planId: ${planId}`);
      }

      console.log(
        `Lock acquired for planId: ${planId}, user: ${currentUserId}`,
      );
      await job.updateProgress(25);

      const orderListing = await fetchListing(orderId as string);
      await job.updateProgress(50);

      // Re-fetch fresh plan before mutation
      const updatingPlan = await fetchListing(planId as string);
      const { participants = [], anonymous = [] } =
        Listing(orderListing).getMetadata() ?? {};
      const currentMetadata = Listing(updatingPlan).getMetadata() ?? {};
      const orderDetail = currentMetadata.orderDetail ?? {};

      // Merge logic
      if (orderDay && memberOrders) {
        orderDetail[orderDay] = orderDetail[orderDay] || { memberOrders: {} };
        orderDetail[orderDay].memberOrders =
          orderDetail[orderDay].memberOrders || {};
        orderDetail[orderDay].memberOrders[currentUserId] =
          memberOrders[currentUserId];
      } else if (orderDays && planData) {
        orderDays.forEach((day) => {
          orderDetail[day] = orderDetail[day] || { memberOrders: {} };
          orderDetail[day].memberOrders = orderDetail[day].memberOrders || {};
          const userData = planData?.[day]?.[currentUserId];
          if (userData !== undefined) {
            orderDetail[day].memberOrders[currentUserId] = userData;
          }
        });
      }

      await job.updateProgress(75);
      await lock.extend();

      const planResponse = await sdk.listings.update(
        {
          id: planId,
          metadata: { orderDetail },
        },
        { expand: true },
      );

      if (
        !participants.includes(currentUserId) &&
        !anonymous.includes(currentUserId)
      ) {
        await sdk.listings.update({
          id: orderId,
          metadata: {
            anonymous: [...anonymous, currentUserId],
          },
        });
      }

      await job.updateProgress(100);
      console.log(
        `Job done for planId: ${planId}, user: ${currentUserId}, memberOrders: ${memberOrders}, orderDay: ${orderDay}, orderDays: ${orderDays}, planData: ${planData}`,
      );

      return denormalisedResponseEntities(planResponse)[0];
    } catch (error) {
      console.error('Process order error:', {
        planId,
        currentUserId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      try {
        const released = await lock.release();
        if (!released) {
          console.warn(`Failed to release lock for planId: ${planId}`);
        } else {
          console.log(`Lock released for planId: ${planId}`);
        }
      } catch (releaseError) {
        console.error('Error releasing lock:', releaseError);
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    maxStalledCount: 1,
    stalledInterval: 30000,
  },
);

// Job events
worker.on('error', (error) => {
  console.error('Worker error:', error);
});

worker.on('stalled', (jobId) => {
  console.warn('Job stalled:', jobId);
});

worker.on('failed', (job, error) => {
  console.error('Job failed:', {
    jobId: job?.id,
    data: job?.data,
    error: error.message,
  });
});

// Add to queue
export const addToProcessOrderQueue = async (data: AddToQueueData) => {
  const deduplicationKey = `${data.orderId}-${data.planId}-${data.currentUserId}`;
  try {
    await processOrderQueue.remove(deduplicationKey);
    const job = await processOrderQueue.add(queueName, data, {
      jobId: deduplicationKey,
      removeOnComplete: 10,
      removeOnFail: 5,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      priority: data.orderDays?.length || 1,
    });

    return job;
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate')) {
      console.log(`Duplicate job ignored for ${deduplicationKey}`);

      return null;
    }
    throw error;
  }
};

// Shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await processOrderQueue.close();
  process.exit(0);
});

export { processOrderQueue, worker };
