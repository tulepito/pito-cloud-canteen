import type { Job } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import type { Redis } from 'ioredis';

import { fetchListing } from '@services/integrationHelper';
import { defaultQueueConfig } from '@services/queues/config';
import { redisConnection } from '@services/redis';
import { getIntegrationSdk } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { ESlackNotificationType } from '@src/utils/enums';
import {
  buildActualUserPlan,
  buildExpectedUserPlan,
  buildUserActions,
  verifyOrderPersistence,
} from '@src/utils/order';

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
    const startTime = Date.now();
    console.log(
      `[RACE_DEBUG] Lock acquisition attempt ${attempts + 1}/${
        this.maxRetries
      } for ${this.lockKey}, token: ${this.token}`,
    );

    const result = (await this.redis.eval(
      ACQUIRE_LOCK_SCRIPT,
      1,
      this.lockKey,
      this.token,
      this.ttl,
    )) as number;

    const duration = Date.now() - startTime;

    if (result === 1) {
      console.log(
        `[RACE_DEBUG] Lock acquired successfully for ${this.lockKey} after ${
          attempts + 1
        } attempts, duration: ${duration}ms, token: ${this.token}`,
      );

      return true;
    }

    if (attempts >= this.maxRetries) {
      console.error(
        `[RACE_DEBUG] Lock acquisition failed after ${
          attempts + 1
        } attempts for ${this.lockKey}, total duration: ${duration}ms, token: ${
          this.token
        }`,
      );

      return false;
    }

    const delay = this.retryDelay * 1.5 ** Math.min(attempts, 10);
    console.warn(
      `[RACE_DEBUG] Lock busy for ${
        this.lockKey
      }, retrying in ${delay}ms (attempt ${attempts + 1}/${
        this.maxRetries
      }), token: ${this.token}`,
    );

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
    const jobStartTime = Date.now();
    const {
      orderId,
      planId,
      memberOrders,
      orderDay,
      orderDays,
      planData,
      currentUserId,
    } = job.data;

    console.log(
      `[RACE_DEBUG] Job started - planId: ${planId}, userId: ${currentUserId}, orderId: ${orderId}, jobId: ${
        job.id
      }, timestamp: ${new Date().toISOString()}`,
    );

    const sdk = getIntegrationSdk();
    let originalOrderDetailBefore: Record<string, any> = {};
    const lock = new DistributedLock(
      redisConnection as Redis,
      `plan:${planId}`,
      {
        ttl: 30000,
        retryDelay: 100,
        maxRetries: 100, // Maybe bug here
      },
    );

    try {
      console.log(
        `[RACE_DEBUG] Attempting to acquire lock for planId: ${planId}, userId: ${currentUserId}`,
      );

      const lockAcquired = await lock.acquire();
      if (!lockAcquired) {
        console.error(
          `[RACE_DEBUG] CRITICAL: Failed to acquire lock for planId: ${planId}, userId: ${currentUserId} after all retries`,
        );
        throw new Error(`Failed to acquire lock for planId: ${planId}`);
      }

      const lockAcquiredTime = Date.now();
      console.log(
        `[RACE_DEBUG] Lock acquired for planId: ${planId}, user: ${currentUserId}, lock acquisition took: ${
          lockAcquiredTime - jobStartTime
        }ms`,
      );
      await job.updateProgress(25);

      const orderListing = await fetchListing(orderId as string);
      await job.updateProgress(50);

      console.log(
        `[RACE_DEBUG] Fetching fresh plan data for planId: ${planId}, userId: ${currentUserId}`,
      );

      // Re-fetch fresh plan before mutation
      const updatingPlan = await fetchListing(planId as string);
      const { participants = [], anonymous = [] } =
        Listing(orderListing).getMetadata() ?? {};
      const currentMetadata = Listing(updatingPlan).getMetadata() ?? {};
      const orderDetail = currentMetadata.orderDetail ?? {};

      // Log the current state before modification
      console.log(
        `[RACE_DEBUG] Current orderDetail state for planId: ${planId}, userId: ${currentUserId}:`,
        JSON.stringify(orderDetail, null, 2),
      );

      const originalOrderDetail = JSON.parse(JSON.stringify(orderDetail));
      originalOrderDetailBefore = originalOrderDetail;

      // Merge logic
      if (orderDay && memberOrders) {
        console.log(
          `[RACE_DEBUG] Processing single day order - planId: ${planId}, userId: ${currentUserId}, orderDay: ${orderDay}`,
        );
        orderDetail[orderDay] = orderDetail[orderDay] || { memberOrders: {} };
        orderDetail[orderDay].memberOrders =
          orderDetail[orderDay].memberOrders || {};
        orderDetail[orderDay].memberOrders[currentUserId] =
          memberOrders[currentUserId];
      } else if (orderDays && planData) {
        console.log(
          `[RACE_DEBUG] Processing multiple days order - planId: ${planId}, userId: ${currentUserId}, orderDays: ${orderDays?.join(
            ', ',
          )}`,
        );
        orderDays.forEach((day) => {
          orderDetail[day] = orderDetail[day] || { memberOrders: {} };
          orderDetail[day].memberOrders = orderDetail[day].memberOrders || {};
          const userData = planData?.[day]?.[currentUserId];
          if (userData !== undefined) {
            orderDetail[day].memberOrders[currentUserId] = userData;
          }
        });
      }

      // Log what changed
      console.log(
        `[RACE_DEBUG] OrderDetail changes for planId: ${planId}, userId: ${currentUserId}:`,
        {
          before: originalOrderDetail,
          after: orderDetail,
          timestamp: new Date().toISOString(),
        },
      );

      await job.updateProgress(75);
      await lock.extend();

      console.log(
        `[RACE_DEBUG] Updating plan listing for planId: ${planId}, userId: ${currentUserId}`,
      );

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
        console.log(
          `[RACE_DEBUG] Adding user ${currentUserId} to anonymous participants for orderId: ${orderId}`,
        );
        await sdk.listings.update({
          id: orderId,
          metadata: {
            anonymous: [...anonymous, currentUserId],
          },
        });
      }

      await job.updateProgress(100);
      const totalDuration = Date.now() - jobStartTime;
      console.log(
        `[RACE_DEBUG] Job completed successfully - planId: ${planId}, userId: ${currentUserId}, total duration: ${totalDuration}ms, memberOrders: ${JSON.stringify(
          memberOrders,
        )}, orderDay: ${orderDay}, orderDays: ${orderDays?.join(
          ', ',
        )}, planData keys: ${
          planData ? Object.keys(planData).join(', ') : 'none'
        }`,
      );

      return denormalisedResponseEntities(planResponse)[0];
    } catch (error) {
      const totalDuration = Date.now() - jobStartTime;
      console.error(
        `[RACE_DEBUG] Process order error after ${totalDuration}ms:`,
        {
          planId,
          currentUserId,
          orderId,
          jobId: job.id,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        },
      );
      try {
        const orderLink = `${
          process.env.NEXT_PUBLIC_APP_URL || ''
        }/participant/orders/${orderId}`;
        await createSlackNotification(
          ESlackNotificationType.PARTICIPANT_ORDER_PERSISTENCE_FAILED,
          {
            orderLink,
            orderCode: '',
            orderName: '',
            planId,
            userId: currentUserId,
            actions: [],
            expected: {},
            actual: {},
            failedAt: 'job-exception',
            service: 'processOrder.job',
            jobId: job.id,
            error: error instanceof Error ? error.message : String(error),
            totalJobDurationMs: Date.now() - jobStartTime,
          } as any,
        );
      } catch (notifyErr) {
        console.error('[RACE_DEBUG] Slack notify failed:', notifyErr);
      }
      throw error;
    } finally {
      try {
        console.log(
          `[RACE_DEBUG] Attempting to release lock for planId: ${planId}, userId: ${currentUserId}`,
        );
        const released = await lock.release();
        if (!released) {
          console.warn(
            `[RACE_DEBUG] WARNING: Failed to release lock for planId: ${planId}, userId: ${currentUserId} - lock may have been stolen or expired`,
          );
        } else {
          console.log(
            `[RACE_DEBUG] Lock released successfully for planId: ${planId}, userId: ${currentUserId}`,
          );
          // Verify persistence AFTER releasing lock
          try {
            const freshPlan = await fetchListing(planId as string);
            const daysToCheck: string[] = orderDay
              ? [String(orderDay)]
              : (orderDays as string[]) || [];

            // Build expected user plan
            const expectedUserPlan = buildExpectedUserPlan(
              daysToCheck,
              planData || {},
              currentUserId,
            );

            // Build user actions
            const userActions = buildUserActions(
              daysToCheck,
              planData || {},
              currentUserId,
              originalOrderDetailBefore,
            );

            // Build actual user plan
            const actualUserPlan = buildActualUserPlan(
              freshPlan,
              currentUserId,
              daysToCheck,
            );

            // Verify persistence using utils
            await verifyOrderPersistence({
              orderId,
              planId,
              currentUserId,
              jobId: job.id as string,
              jobStartTime,
              orderDay,
              orderDays: daysToCheck,
              expectedUserPlan,
              actualUserPlan,
              userActions,
            });
          } catch (verifyAfterReleaseError) {
            console.error(
              '[RACE_DEBUG] Verification after release failed:',
              verifyAfterReleaseError,
            );
            try {
              await createSlackNotification(
                ESlackNotificationType.PARTICIPANT_ORDER_PERSISTENCE_FAILED,
                {
                  service: 'processOrder.job',
                  failedAt: 'verify-after-release-failed',
                  orderId,
                  planId,
                  userId: currentUserId,
                  error:
                    verifyAfterReleaseError instanceof Error
                      ? verifyAfterReleaseError.message
                      : String(verifyAfterReleaseError),
                  jobId: job.id,
                  totalJobDurationMs: Date.now() - jobStartTime,
                } as any,
              );
            } catch (_notifyErr) {
              // ignore
            }
          }
        }
      } catch (releaseError) {
        console.error(
          `[RACE_DEBUG] Error releasing lock for planId: ${planId}, userId: ${currentUserId}:`,
          releaseError,
        );
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
  console.error('[RACE_DEBUG] Worker error:', error);
});

worker.on('stalled', (jobId) => {
  console.warn(
    `[RACE_DEBUG] Job stalled - this may indicate a race condition or deadlock: ${jobId}`,
  );
});

worker.on('failed', (job, error) => {
  console.error('[RACE_DEBUG] Job failed:', {
    jobId: job?.id,
    planId: job?.data?.planId,
    userId: job?.data?.currentUserId,
    orderId: job?.data?.orderId,
    data: job?.data,
    error: error.message,
    stack: error.stack,
    attemptsMade: job?.attemptsMade,
    timestamp: new Date().toISOString(),
  });
});

// Add to queue
export const addToProcessOrderQueue = async (data: AddToQueueData) => {
  const deduplicationKey = `${data.orderId}-${data.planId}-${data.currentUserId}`;
  const startTime = Date.now();

  try {
    console.log(
      `[RACE_DEBUG] Attempting to add job to queue - userId: ${
        data.currentUserId
      }, planId: ${data.planId}, orderId: ${
        data.orderId
      }, deduplicationKey: ${deduplicationKey}, timestamp: ${new Date().toISOString()}`,
    );

    // Check if job already exists
    const existingJob = await processOrderQueue.getJob(deduplicationKey);
    if (existingJob) {
      console.log(
        `[RACE_DEBUG] Existing job found for deduplicationKey: ${deduplicationKey}, jobId: ${
          existingJob.id
        }, state: ${await existingJob.getState()}, removing it first`,
      );
    }

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

    const duration = Date.now() - startTime;
    console.log(
      `[RACE_DEBUG] Job added successfully to queue - userId: ${
        data.currentUserId
      }, planId: ${data.planId}, jobId: ${job.id}, priority: ${
        data.orderDays?.length || 1
      }, duration: ${duration}ms`,
    );

    if (await job.isFailed()) {
      await createSlackNotification(
        ESlackNotificationType.PARTICIPANT_ORDER_PERSISTENCE_FAILED,
        {
          service: 'processOrder.queue',
          failedAt: 'queue-overloaded',
          orderId: data.orderId,
          planId: data.planId,
          userId: data.currentUserId,
          error: `Queue job failed with reason: ${job.failedReason}`,
        } as any,
      );
    }

    return job;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof Error && error.message.includes('duplicate')) {
      console.log(
        `[RACE_DEBUG] Duplicate job ignored for ${deduplicationKey}, userId: ${data.currentUserId}, duration: ${duration}ms - this indicates potential race condition`,
      );

      return null;
    }

    console.error(
      `[RACE_DEBUG] Error adding job to queue for userId: ${data.currentUserId}, planId: ${data.planId}, duration: ${duration}ms:`,
      error,
    );
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
