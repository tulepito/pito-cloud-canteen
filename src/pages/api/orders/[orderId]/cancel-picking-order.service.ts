import pLimit from 'p-limit';
import pRetry from 'p-retry';

import { denormalisedResponseEntities } from '@services/data';
import type { TEmailTemplateTypes } from '@services/email';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotification } from '@services/nativeNotification';
import { getIntegrationSdk } from '@services/sdk';
import { Listing } from '@utils/data';
import {
  ENativeNotificationType,
  EOrderStates,
  EParticipantOrderStatus,
} from '@utils/enums';

// Create rate limiters for different operations
const emailLimit = pLimit(10); // Process max 10 emails concurrently
const notificationLimit = pLimit(15); // Process max 15 notifications concurrently
const planLimit = pLimit(5); // Process max 5 plans concurrently

// Helper function to send email with retry logic
const sendEmailWithRetry = async (
  templateType: TEmailTemplateTypes,
  params: any,
) => {
  return pRetry(
    async () => {
      await emailSendingFactory(templateType, params);
    },
    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 5000,
      onFailedAttempt: (error) => {
        console.warn(
          `Email sending attempt ${error.attemptNumber} failed for ${templateType}:`,
          error.message,
        );
      },
    },
  );
};

// Helper function to create notification with retry logic
const createNotificationWithRetry = async (
  type: ENativeNotificationType,
  params: any,
) => {
  return pRetry(
    async () => {
      await createNativeNotification(type, params);
    },
    {
      retries: 2,
      minTimeout: 500,
      maxTimeout: 2000,
      onFailedAttempt: (error) => {
        console.warn(
          `Notification creation attempt ${error.attemptNumber} failed:`,
          error.message,
        );
      },
    },
  );
};

export const cancelPickingOrder = async (orderId: string) => {
  console.log(`Starting cancelPickingOrder for orderId: ${orderId}`);

  const integrationSdk = await getIntegrationSdk();
  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: orderId }),
  );

  const {
    orderState,
    orderStateHistory = [],
    plans = [],
    participants = [],
    anonymous = [],
  } = Listing(orderListing).getMetadata();

  console.log(
    `Order ${orderId}: state=${orderState}, plans=${plans.length}, participants=${participants.length}, anonymous=${anonymous.length}`,
  );

  if (orderState !== EOrderStates.picking) {
    throw new Error(`Order is not in picking state, orderState: ${orderState}`);
  }

  // Update order state
  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: EOrderStates.canceled,
      orderStateHistory: orderStateHistory.concat({
        state: EOrderStates.canceled,
        updatedAt: new Date().getTime(),
      }),
    },
  });

  // Send email for booker about order cancel (no need for rate limiting single email)
  try {
    await sendEmailWithRetry(EmailTemplateTypes.BOOKER.BOOKER_ORDER_CANCELLED, {
      orderId,
    });
  } catch (error) {
    console.error('Failed to send booker cancellation email:', error);
    // Don't throw here as we want to continue with participant notifications
  }

  // Process all plans concurrently with rate limiting
  const planProcessingPromises = plans.map((planId: string) =>
    planLimit(async () => {
      try {
        const plan = await fetchListing(planId);
        const { orderDetail = {} } = Listing(plan).getMetadata();

        const allParticipants = [...participants, ...anonymous];

        // Send notifications to all participants for this plan
        const notificationPromises = allParticipants.map(
          (participantId: string) =>
            notificationLimit(() =>
              createNotificationWithRetry(
                ENativeNotificationType.TransitOrderStateToCanceled,
                {
                  participantId,
                  planId,
                  order: orderListing,
                },
              ),
            ),
        );

        // Collect all participant emails for this plan
        const participantEmailPromises: Promise<void>[] = [];

        console.log(
          `Plan ${planId}: Checking orderDetail with ${
            Object.keys(orderDetail).length
          } dates`,
        );

        Object.keys(orderDetail).forEach((dateAsTimeStamp) => {
          const { memberOrders = {} } = orderDetail[dateAsTimeStamp] || {};
          console.log(
            `Plan ${planId}, Date ${dateAsTimeStamp}: Found ${
              Object.keys(memberOrders).length
            } member orders`,
          );

          Object.keys(memberOrders).forEach((partId) => {
            const { status, foodId } = memberOrders[partId] || {};
            console.log(
              `Plan ${planId}, Participant ${partId}: status=${status}, foodId=${foodId}`,
            );

            if (status === EParticipantOrderStatus.joined && !!foodId) {
              console.log(
                `Plan ${planId}: Adding email for participant ${partId}`,
              );
              participantEmailPromises.push(
                emailLimit(() =>
                  sendEmailWithRetry(
                    EmailTemplateTypes.PARTICIPANT
                      .PARTICIPANT_SUB_ORDER_CANCELED,
                    {
                      orderId,
                      timestamp: dateAsTimeStamp,
                      participantId: partId,
                    },
                  ),
                ),
              );
            }
          });
        });

        // Wait for all notifications and emails for this plan
        console.log(
          `Plan ${planId}: Processing ${allParticipants.length} notifications, ${participantEmailPromises.length} emails`,
        );

        const [notificationResults, emailResults] = await Promise.allSettled([
          Promise.allSettled(notificationPromises),
          Promise.allSettled(participantEmailPromises),
        ]);

        // Log any failures for monitoring
        const failedNotifications =
          notificationResults.status === 'fulfilled'
            ? notificationResults.value.filter(
                (result) => result.status === 'rejected',
              ).length
            : 0;

        const failedEmails =
          emailResults.status === 'fulfilled'
            ? emailResults.value.filter(
                (result) => result.status === 'rejected',
              ).length
            : 0;

        const successfulNotifications =
          allParticipants.length - failedNotifications;
        const successfulEmails = participantEmailPromises.length - failedEmails;

        console.log(
          `Plan ${planId} completed: ${successfulNotifications}/${allParticipants.length} notifications, ${successfulEmails}/${participantEmailPromises.length} emails sent`,
        );

        if (failedNotifications > 0) {
          console.error(
            `Plan ${planId}: ${failedNotifications} notifications failed`,
          );
        }

        if (failedEmails > 0) {
          console.error(
            `Plan ${planId}: ${failedEmails} participant emails failed`,
          );
        }
      } catch (error) {
        console.error(`Failed to process plan ${planId}:`, error);
        // Continue processing other plans even if one fails
      }
    }),
  );

  // Wait for all plans to be processed
  const planResults = await Promise.allSettled(planProcessingPromises);

  // Log overall results
  const failedPlans = planResults.filter(
    (result) => result.status === 'rejected',
  ).length;
  const successfulPlans = plans.length - failedPlans;

  console.log(
    `Order ${orderId} cancellation completed: ${successfulPlans}/${plans.length} plans processed successfully`,
  );

  if (failedPlans > 0) {
    console.error(`${failedPlans} plans failed to process completely`);
  }
};
