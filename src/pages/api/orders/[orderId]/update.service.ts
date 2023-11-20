import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import { calculateGroupMembers, getAllCompanyMembers } from '@helpers/company';
import { sendNotificationToParticipantOnUpdateOrder } from '@pages/api/apiServices/notification';
import {
  createOrUpdateAutomaticStartOrderScheduler,
  createScheduler,
  getScheduler,
  updateScheduler,
} from '@services/awsEventBrigdeScheduler';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createNativeNotification } from '@services/nativeNotification';
import {
  ENativeNotificationType,
  EOrderStates,
  EOrderType,
} from '@src/utils/enums';
import type { TObject } from '@src/utils/types';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { formatTimestamp, VNTimezone } from '@utils/dates';

const updateOrder = async ({
  orderId,
  generalInfo,
  isAdminFlow,
}: {
  orderId: string;
  generalInfo: TObject;
  isAdminFlow?: boolean;
}) => {
  const integrationSdk = getIntegrationSdk();

  const orderListing = await fetchListing(orderId);
  const {
    companyId,
    selectedGroups = [],
    orderStateHistory = [],
    startDate,
    deliveryHour,
    orderType = EOrderType.group,
  } = Listing(orderListing).getMetadata();
  const companyAccount = await fetchUser(companyId);

  let updatedOrderListing;
  const isOrderHasInProgressState = orderStateHistory.some(
    (state: { state: string; createdAt: number }) =>
      state.state === EOrderStates.inProgress,
  );
  const isGroupOrder = orderType === EOrderType.group;

  if (!isEmpty(generalInfo)) {
    const newSelectedGroup = generalInfo.selectedGroups || selectedGroups;

    const participants: string[] = isEmpty(newSelectedGroup)
      ? getAllCompanyMembers(companyAccount)
      : calculateGroupMembers(companyAccount, newSelectedGroup);
    const {
      startDate: updateStartDate,
      endDate: updateEndDate,
      deadlineDate,
      orderState: updatedOrderState,
      deliveryHour: updateDeliveryHour,
    } = generalInfo;

    if (deadlineDate) {
      const reminderTime = DateTime.fromMillis(deadlineDate)
        .setZone(VNTimezone)
        .minus({
          minutes: 30,
        })
        .toMillis();
      try {
        await getScheduler(`sendRemindPOE_${orderId}`);
        await updateScheduler({
          customName: `sendRemindPOE_${orderId}`,
          timeExpression: formatTimestamp(
            reminderTime,
            "yyyy-MM-dd'T'hh:mm:ss",
          ),
        });
      } catch (error) {
        console.log('create scheduler in update order');
        await createScheduler({
          customName: `sendRemindPOE_${orderId}`,
          timeExpression: formatTimestamp(
            reminderTime,
            "yyyy-MM-dd'T'hh:mm:ss",
          ),
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
            orderStateHistory: newOrderStateHistoryMaybe,
            participants,
          },
        },
        { expand: true },
      ),
    );

    // * update AutomaticStartOrderScheduler
    if (updateStartDate || updateDeliveryHour) {
      if (!isAdminFlow && isGroupOrder)
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
  }
  if (!isOrderHasInProgressState) {
    sendNotificationToParticipantOnUpdateOrder(orderId);
  }

  return updatedOrderListing;
};

export default updateOrder;
