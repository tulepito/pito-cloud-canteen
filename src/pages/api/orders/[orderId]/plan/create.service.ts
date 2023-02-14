import { calculateGroupMembers } from '@helpers/companyMembers';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingStates } from '@utils/enums';

const createPlan = async ({
  orderId,
  orderDetail,
}: {
  orderId: string;
  orderDetail: any;
}) => {
  const integrationSdk = getIntegrationSdk();

  const orderListing = await fetchListing(orderId as string);
  const { metadata, title: orderTitle } = orderListing.attributes;

  const { companyId, plans = [], selectedGroups = [] } = metadata;
  const companyAccount = await fetchUser(companyId);

  const { subAccountId } = companyAccount.attributes.profile.privateData;

  const allMembers = calculateGroupMembers(companyAccount, selectedGroups);
  const initialMemberOrder = allMembers.reduce(
    (result: any, _memberId: any) => ({
      ...result,
      [_memberId]: {
        foodId: '',
        status: 'empty',
      },
    }),
    {},
  );

  const updatedOrderDetail = Object.keys(orderDetail).reduce((result, date) => {
    return {
      ...result,
      [date]: {
        ...orderDetail[date],
        memberOrders: initialMemberOrder,
      },
    };
  }, {});

  const planListingResponse = await integrationSdk.listings.create({
    title: `${orderTitle} - Plan week ${plans.length + 1}`,
    authorId: subAccountId,
    state: EListingStates.published,
    metadata: {
      orderDetail: updatedOrderDetail,
      orderId,
      listingType: ListingTypes.PLAN,
    },
  });

  const planListing = denormalisedResponseEntities(planListingResponse)[0];

  await integrationSdk.listings.update({
    id: orderListing.id.uuid,
    metadata: {
      plans: plans.concat(planListing.id.uuid),
    },
  });

  return planListing;
};

export default createPlan;
