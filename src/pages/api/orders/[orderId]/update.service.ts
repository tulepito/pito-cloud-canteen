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
  const { companyId, selectedGroups = [] } =
    Listing(orderListing).getMetadata();
  const companyAccount = await fetchUser(companyId);

  let updatedOrderListing;

  if (!isEmpty(generalInfo)) {
    const newSelectedGroup = generalInfo.selectedGroups || selectedGroups;

    const participants: string[] = isEmpty(newSelectedGroup)
      ? getAllCompanyMembers(companyAccount)
      : calculateGroupMembers(companyAccount, newSelectedGroup);
    const { startDate, endDate, deadlineDate } = generalInfo;

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

    const shouldUpdateOrderName = companyName && startDate && endDate;

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
            participants,
          },
        },
        { expand: true },
      ),
    )[0];

    const { orderState } = generalInfo || {};

    if (orderState === EOrderStates.picking) {
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

  sendNotificationToParticipantOnUpdateOrder(orderId);

  return updatedOrderListing;
};

export default updateOrder;
