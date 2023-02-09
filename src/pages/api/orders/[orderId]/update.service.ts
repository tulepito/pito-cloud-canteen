import {
  calculateGroupMembers,
  getAllCompanyMembers,
} from '@helpers/companyMembers';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, LISTING } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import isEmpty from 'lodash/isEmpty';

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
    LISTING(orderListing).getMetadata();
  const companyAccount = await fetchUser(companyId);

  let updatedOrderListing;

  if (!isEmpty(generalInfo)) {
    const newSelectedGroup = generalInfo.selectedGroups || selectedGroups;

    const participants: string[] = isEmpty(newSelectedGroup)
      ? getAllCompanyMembers(companyAccount)
      : calculateGroupMembers(companyAccount, selectedGroups);
    const { startDate, endDate } = generalInfo;
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
                  orderName: `${
                    companyAccount.attributes.profile.displayName
                  } PCC_${parseTimestampToFormat(
                    generalInfo.startDate,
                  )} - ${parseTimestampToFormat(generalInfo.endDate)}`,
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
