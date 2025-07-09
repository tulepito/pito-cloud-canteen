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

// Redis Lua script for atomic lock acquisition with proper cleanup
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
    options: {
      ttl?: number;
      retryDelay?: number;
      maxRetries?: number;
    } = {},
  ) {
    this.redis = redis;
    this.lockKey = `lock:${resource}`;
    this.token = `${Date.now()}-${Math.random()}`;
    this.ttl = options.ttl || 30000; // 30 seconds
    this.retryDelay = options.retryDelay || 100;
    this.maxRetries = options.maxRetries || 50; // Max 5 seconds wait
  }

  private async tryAcquireLock(attempts = 0): Promise<boolean> {
    const result = (await this.redis.eval(
      ACQUIRE_LOCK_SCRIPT,
      1,
      this.lockKey,
      this.token,
      this.ttl,
    )) as number;

    if (result === 1) {
      return true;
    }

    if (attempts >= this.maxRetries) {
      return false;
    }

    const delay = this.retryDelay * 1.5 ** Math.min(attempts, 10);
    await new Promise((resolve) => {
      setTimeout(resolve, delay);
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

// Create queue with proper deduplication
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

// Worker with proper error handling and concurrency control
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
        ttl: 30000, // 30 seconds
        retryDelay: 100,
        maxRetries: 100, // 10 seconds max wait
      },
    );

    try {
      // Attempt to acquire the lock
      const lockAcquired = await lock.acquire();
      if (!lockAcquired) {
        console.error(`Failed to acquire lock for planId: ${planId}`);
        throw new Error(`Failed to acquire lock for planId: ${planId}`);
      }

      // Update job progress
      await job.updateProgress(25);

      // Fetch fresh data after acquiring lock
      const [orderListing, updatingPlan] = await Promise.all([
        fetchListing(orderId as string),
        fetchListing(planId as string),
      ]);

      await job.updateProgress(50);

      const { participants = [], anonymous = [] } =
        Listing(orderListing).getMetadata() ?? {};

      // Get the latest orderDetail from fresh data
      const currentMetadata = Listing(updatingPlan).getMetadata() ?? {};
      const { orderDetail = {} } = currentMetadata;

      if (orderDay && memberOrders) {
        orderDetail[orderDay].memberOrders[currentUserId] =
          memberOrders[currentUserId];
      } else if (orderDays && planData) {
        orderDays.forEach((day: any) => {
          orderDetail[day].memberOrders[currentUserId] =
            planData?.[day]?.[currentUserId];
        });
      }

      await job.updateProgress(75);

      // Extend lock before long operations
      await lock.extend();

      // Update plan with merged data
      const planResponse = await sdk.listings.update(
        {
          id: planId,
          metadata: { orderDetail },
        },
        { expand: true },
      );

      // Update anonymous list if needed
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

      return denormalisedResponseEntities(planResponse)[0];
    } catch (error) {
      // Log error with context
      console.error('Process order error:', {
        planId,
        currentUserId,
        error: error instanceof Error ? error.message : error,
      });

      throw error;
    } finally {
      // Always release lock
      try {
        const releaseSuccess = await lock.release();
        if (!releaseSuccess) {
          console.warn(`Failed to release lock for planId: ${planId}`);
        }
      } catch (releaseError) {
        console.error('Error releasing lock for planId:', releaseError);
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Allow multiple workers, but lock ensures serialization per plan
    maxStalledCount: 1,
    stalledInterval: 30000,
  },
);

// Enhanced error handling
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

// Enhanced queue add function with proper deduplication
export const addToProcessOrderQueue = async (data: AddToQueueData) => {
  const deduplicationKey = `${data.orderId}-${data.planId}-${data.currentUserId}`;

  try {
    await processOrderQueue.remove(deduplicationKey);

    const job = await processOrderQueue.add(queueName, data, {
      // Use deduplication based on plan and user
      jobId: deduplicationKey,
      // Remove duplicate jobs
      removeOnComplete: 10,
      removeOnFail: 5,
      // Job-specific retry configuration
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      // Priority based on order urgency (if needed)
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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await processOrderQueue.close();
  process.exit(0);
});

export { processOrderQueue, worker };
