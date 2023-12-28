import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import { calculateGroupMembers, getAllCompanyMembers } from '@helpers/company';
import { sendNotificationToParticipantOnUpdateOrder } from '@pages/api/apiServices/notification';
import { pushNativeNotificationOrderDetail } from '@pages/api/helpers/pushNotificationOrderDetailHelper';
import {
  createOrUpdateAutomaticStartOrderScheduler,
  createScheduler,
  getScheduler,
  sendRemindPickingNativeNotificationToBookerScheduler,
  updateScheduler,
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

import { isOrderCreatedByBooker } from '../../../../helpers/orderHelper';

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
  const isCreatedByBooker = isOrderCreatedByBooker(orderStateHistory);
  const isGroupOrder = orderType === EOrderType.group;

  if (!isEmpty(generalInfo)) {
    const {
      startDate: updateStartDate,
      endDate: updateEndDate,
      deadlineDate,
      orderState: updatedOrderState,
      selectedGroups: updateSelectedGroups,
      deliveryHour: updateDeliveryHour,
    } = generalInfo;

    const shouldUpdateParticipantList =
      typeof updateSelectedGroups !== 'undefined';
    const participants: string[] = isEmpty(
      updateSelectedGroups || selectedGroups,
    )
      ? getAllCompanyMembers(companyAccount)
      : calculateGroupMembers(companyAccount, updateSelectedGroups);

    if (deadlineDate) {
      const schedulerName = `sendRemindPOE_${orderId}`;
      const reminderTime = DateTime.fromMillis(deadlineDate)
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
        });
      } catch (error) {
        console.info('create scheduler in update order');
        await createScheduler({
          customName: schedulerName,
          timeExpression,
          params: {
            orderId,
          },
        });
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
                  participants,
                }
              : {}),
            orderStateHistory: newOrderStateHistoryMaybe,
          },
        },
        { expand: true },
      ),
    );

    // * update AutomaticStartOrderScheduler
    if (updateStartDate || updateDeliveryHour) {
      if (isCreatedByBooker && isGroupOrder)
        createOrUpdateAutomaticStartOrderScheduler({
          orderId,
          startDate: updateStartDate || startDate,
          deliveryHour: updateDeliveryHour || deliveryHour,
        });
    }

    if (
      updatedOrderState === EOrderStates.picking &&
      !isOrderHasInProgressState
    ) {
      // * send notification when transit from inprogress back to picking state
      participants.forEach((participantId) => {
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

    if (isGroupOrder && deadlineDate) {
      sendRemindPickingNativeNotificationToBookerScheduler({
        orderId,
        deadlineDate,
      });
    }
  }
  if (!isOrderHasInProgressState) {
    sendNotificationToParticipantOnUpdateOrder(orderId);
  }

  return updatedOrderListing;
};

export default updateOrder;
