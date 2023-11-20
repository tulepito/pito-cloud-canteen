import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import { calculateGroupMembers, getAllCompanyMembers } from '@helpers/company';
import { sendNotificationToParticipantOnUpdateOrder } from '@pages/api/apiServices/notification';
import {
  createScheduler,
  getScheduler,
  updateScheduler,
} from '@services/awsEventBrigdeScheduler';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createNativeNotification } from '@services/nativeNotification';
import { ENativeNotificationType, EOrderStates } from '@src/utils/enums';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { formatTimestamp, VNTimezone } from '@utils/dates';

const updateOrder = async ({
  orderId,
  generalInfo,
}: {
  orderId: string;
  generalInfo: any;
}) => {
  const integrationSdk = getIntegrationSdk();

  const orderListing = await fetchListing(orderId);
  const {
    companyId,
    orderStateHistory = [],
    selectedGroups,
  } = Listing(orderListing).getMetadata();
  const companyAccount = await fetchUser(companyId);

  let updatedOrderListing;
  const isOrderHasInProgressState = orderStateHistory.some(
    ({ state }: { state: string }) => state === EOrderStates.inProgress,
  );

  if (!isEmpty(generalInfo)) {
    const {
      startDate,
      endDate,
      deadlineDate,
      orderState: updatedOrderState,
      selectedGroups: updateSelectedGroups,
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

    const shouldUpdateOrderName = companyName && startDate && endDate;
    const newOrderStateHistory = updatedOrderState
      ? orderStateHistory.concat({
          state: updatedOrderState,
          updatedAt: Date.now(),
        })
      : orderStateHistory;
    // eslint-disable-next-line prefer-destructuring
    updatedOrderListing = denormalisedResponseEntities(
      await integrationSdk.listings.update(
        {
          id: orderId,
          ...(shouldUpdateOrderName
            ? {
                publicData: {
                  companyName,
                  orderName: `${companyName}_${formatTimestamp(
                    generalInfo.startDate,
                  )} - ${formatTimestamp(generalInfo.endDate)}`,
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
            orderStateHistory: newOrderStateHistory,
          },
        },
        { expand: true },
      ),
    )[0];

    const { orderState } = generalInfo || {};

    if (orderState === EOrderStates.picking && !isOrderHasInProgressState) {
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
