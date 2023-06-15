import {
  normalizeOrderDetail,
  prepareNewPlanOrderDetail,
} from '@pages/api/orders/utils';
import { denormalisedResponseEntities } from '@services/data';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/sdk';
import { getSubAccountTrustedSdk } from '@services/subAccountSdk';
import config from '@src/configs';
import { Listing, Transaction } from '@utils/data';
import { ETransition } from '@utils/transaction';
import type { TObject } from '@utils/types';

export const initiateTransaction = async ({
  orderId,
  planId,
}: {
  orderId: string;
  planId: string;
}) => {
  // Query order and plan listing
  const integrationSdk = getIntegrationSdk();
  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: orderId,
    }),
  );
  const [planListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: planId,
    }),
  );

  const orderData = Listing(orderListing);
  const { companyId, deliveryHour, plans = [] } = orderData.getMetadata();

  if (plans.length === 0 || !plans.includes(planId)) {
    throw new Error(`Invalid planId, ${planId}`);
  }

  const companyAccount = await fetchUser(companyId);
  const { subAccountId } = companyAccount.attributes.profile.privateData;
  const companySubAccount = await fetchUser(subAccountId);
  const subAccountTrustedSdk = await getSubAccountTrustedSdk(companySubAccount);
  const { orderDetail: planOrderDetail } = Listing(planListing).getMetadata();

  // Normalize order detail
  const normalizedOrderDetail = normalizeOrderDetail({
    orderId,
    planId,
    planOrderDetail,
    deliveryHour,
  });

  const transactionMap: TObject = {};
  // Initiate transaction for each date
  await Promise.all(
    normalizedOrderDetail.map(async (item, index) => {
      const {
        params: {
          listingId,
          bookingStart,
          bookingEnd,
          bookingDisplayStart,
          bookingDisplayEnd,
          extendedData: { metadata },
        },
        date,
      } = item;

      const createTxResponse = await subAccountTrustedSdk.transactions.initiate(
        {
          processAlias: config.bookingProcessAlias,
          transition: ETransition.INITIATE_TRANSACTION,
          params: {
            listingId,
            bookingStart,
            bookingEnd,
            bookingDisplayStart,
            bookingDisplayEnd,
            metadata: {
              ...metadata,
              isLastTxOfPlan: index === normalizedOrderDetail.length - 1,
            },
          },
        },
      );

      const [tx] = denormalisedResponseEntities(createTxResponse);
      const txId = Transaction(tx).getId() as string;

      transactionMap[date] = txId;

      return txId;
    }),
  );

  // Update new order detail of plan listing
  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      orderDetail: prepareNewPlanOrderDetail(planOrderDetail, transactionMap),
    },
  });
};
