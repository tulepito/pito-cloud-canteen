import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import { calculateGroupMembers, getAllCompanyMembers } from '@helpers/company';
import {
  createScheduler,
  getScheduler,
  updateScheduler,
} from '@services/awsEventBrigdeScheduler';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
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
        console.log('create scheduler');
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

    const companyDisplayName = companyAccount.attributes.profile.displayName;

    const shouldUpdateOrderName = companyDisplayName && startDate && endDate;
    // eslint-disable-next-line prefer-destructuring
    updatedOrderListing = denormalisedResponseEntities(
      await integrationSdk.listings.update(
        {
          id: orderId,
          ...(shouldUpdateOrderName
            ? {
                publicData: {
                  orderName: `PCC_${formatTimestamp(
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
  }

  return updatedOrderListing;
};

export default updateOrder;
