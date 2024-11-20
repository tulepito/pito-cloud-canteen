import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingStates, EListingType, EOrderType } from '@utils/enums';

import { getInitMemberOrder } from './memberOrder.helper';

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

  const {
    companyId,
    plans = [],
    selectedGroups = [],
    orderType = EOrderType.group,
  } = metadata;
  const isGroupOrder = orderType === EOrderType.group;
  const companyAccount = await fetchUser(companyId);

  const { subAccountId } = companyAccount.attributes.profile.privateData;

  const initialMemberOrder = await getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  const updatedOrderDetail = Object.keys(orderDetail).reduce((result, date) => {
    return {
      ...result,
      [date]: {
        ...orderDetail[date],
        memberOrders: isGroupOrder ? {} : initialMemberOrder,
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
      listingType: EListingType.subOrder,
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
