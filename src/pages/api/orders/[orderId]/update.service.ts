/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import {
  calculateGroupMembers,
  ensureActiveUserIds,
  getAllCompanyMembers,
} from '@helpers/company';
import { sendNotificationToParticipantOnUpdateOrder } from '@pages/api/apiServices/notification';
import { pushNativeNotificationOrderDetail } from '@pages/api/helpers/pushNotificationOrderDetailHelper';
import {
  createScheduler,
  getScheduler,
  sendRemindPickingNativeNotificationToBookerScheduler,
  updateScheduler,
  upsertAutomaticStartOrderScheduler,
} from '@services/awsEventBrigdeScheduler';
import {
  adminQueryListings,
  fetchListing,
  fetchUser,
} from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createNativeNotification } from '@services/nativeNotification';
import {
  ENativeNotificationType,
  EOrderStates,
  EOrderType,
} from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { formatTimestamp, VNTimezone } from '@utils/dates';

const updateOrder = async ({
  orderId,
  generalInfo,
}: {
  orderId: string;
  generalInfo: TObject;
}) => {
  const integrationSdk = getIntegrationSdk();

  const orderListing = await fetchListing(orderId);
  const {
    companyId,
    selectedGroups = [],
    plans = [],
    orderState: currentOrderState,
    orderStateHistory = [],
    startDate,
    deliveryHour,
    orderType = EOrderType.group,
  } = Listing(orderListing).getMetadata();
  const companyAccount = await fetchUser(companyId);

  let updatedOrderListing;
  const isOrderHasInProgressState = orderStateHistory.some(
    ({ state }: { state: string }) => state === EOrderStates.inProgress,
  );
  const isGroupOrder = orderType === EOrderType.group;

  if (!isEmpty(generalInfo)) {
    const {
      startDate: updateStartDate,
      endDate: updateEndDate,
      deadlineDate: updateDeadlineDate,
      orderState: updatedOrderState,
      selectedGroups: updateSelectedGroups,
      deliveryHour: updateDeliveryHour,
    } = generalInfo;

    const shouldUpdateParticipantList =
      typeof updateSelectedGroups !== 'undefined';

    const activeParticipantIds: string[] = isEmpty(
      updateSelectedGroups || selectedGroups,
    )
      ? await ensureActiveUserIds(getAllCompanyMembers(companyAccount))
      : await ensureActiveUserIds(
          calculateGroupMembers(companyAccount, updateSelectedGroups),
        );

    if (updateDeadlineDate) {
      const schedulerName = `sendRemindPOE${orderId}`;
      const reminderTime = DateTime.fromMillis(updateDeadlineDate)
        .setZone(VNTimezone)
        .minus({
          minutes: 30,
        })
        .toMillis();
      const timeExpression = formatTimestamp(
        reminderTime,
        "yyyy-MM-dd'T'hh:mm:ss",
      );
      try {
        await getScheduler(schedulerName);
        await updateScheduler({
          customName: schedulerName,
          timeExpression,
          arn: process.env.LAMBDA_ARN,
        });
      } catch (error) {
        console.info('create scheduler in update order');
        try {
          await createScheduler({
            customName: schedulerName,
            timeExpression,
            arn: process.env.LAMBDA_ARN,
            params: {
              orderId,
            },
          });
        } catch {
          // ignore error
        }
      }
    }

    const { companyName } = companyAccount.attributes.profile.publicData;

    const shouldUpdateOrderName =
      companyName && updateStartDate && updateEndDate;
    const newOrderStateHistoryMaybe = updatedOrderState
      ? orderStateHistory.concat({
          state: updatedOrderState,
          updatedAt: Date.now(),
        })
      : orderStateHistory;

    [updatedOrderListing] = denormalisedResponseEntities(
      await integrationSdk.listings.update(
        {
          id: orderId,
          ...(shouldUpdateOrderName
            ? {
                publicData: {
                  companyName,
                  orderName: `${companyName}_${formatTimestamp(
                    updateStartDate,
                  )} - ${formatTimestamp(updateEndDate)}`,
                },
              }
            : {}),
          metadata: {
            ...generalInfo,
            ...(shouldUpdateParticipantList
              ? {
                  participants: activeParticipantIds,
                }
              : {}),
            orderStateHistory: newOrderStateHistoryMaybe,
          },
        },
        { expand: true },
      ),
    );

    if (isGroupOrder) {
      if (updateStartDate || updateDeliveryHour) {
        upsertAutomaticStartOrderScheduler({
          orderId,
          startDate: updateStartDate || startDate,
          deliveryHour: updateDeliveryHour || deliveryHour,
        });
      }
    }

    if (
      updatedOrderState === EOrderStates.picking &&
      !isOrderHasInProgressState
    ) {
      // * send notification when transit from inprogress back to picking state
      activeParticipantIds.forEach((participantId) => {
        createNativeNotification(
          ENativeNotificationType.BookerTransitOrderStateToPicking,
          {
            participantId,
            order: orderListing,
          },
        );
      });
    }

    if (!updatedOrderState && currentOrderState === EOrderStates.inProgress) {
      const orderUpdated = await fetchListing(orderId);
      const planListings: [] = await adminQueryListings({ ids: plans });
      planListings.forEach(async (plan: TListing) => {
        const { orderDetail: orderDetailUpdated } = Listing(plan).getMetadata();
        await pushNativeNotificationOrderDetail(
          orderDetailUpdated,
          orderUpdated,
          ENativeNotificationType.AdminUpdateOrder,
          integrationSdk,
        );
      });
    }

    if (isGroupOrder && updateDeadlineDate) {
      sendRemindPickingNativeNotificationToBookerScheduler({
        orderId,
        deadlineDate: updateDeadlineDate,
      });
    }
  }
  if (!isOrderHasInProgressState) {
    sendNotificationToParticipantOnUpdateOrder(orderId);
  }

  return updatedOrderListing;
};

export default updateOrder;
