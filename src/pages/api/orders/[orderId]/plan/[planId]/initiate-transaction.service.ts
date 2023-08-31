import uniq from 'lodash/uniq';

import {
  normalizeOrderDetail,
  prepareNewPlanOrderDetail,
} from '@pages/api/orders/utils';
import { denormalisedResponseEntities } from '@services/data';
import { fetchUser } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import { getIntegrationSdk } from '@services/sdk';
import { getSubAccountTrustedSdk } from '@services/subAccountSdk';
import config from '@src/configs';
import { Listing, Transaction, User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import {
  ENotificationType,
  EOrderType,
  EPartnerVATSetting,
} from '@src/utils/enums';
import { ETransition } from '@utils/transaction';
import type { TListing, TObject, TTransaction } from '@utils/types';

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
  const {
    companyId,
    deliveryHour,
    plans = [],
    orderType = EOrderType.group,
    companyName = 'PCC',
    orderVATPercentage,
    serviceFees = {},
    hasSpecificPCCFee = false,
    specificPCCFee = 0,
  } = orderData.getMetadata();
  const isGroupOrder = orderType === EOrderType.group;

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
    isGroupOrder,
  });

  const transactionMap: TObject = {};
  const partnerIds: string[] = [];
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
      partnerIds.push(listingId);

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
              timestamp: date,
              orderVATPercentage,
              serviceFees,
              hasSpecificPCCFee,
              specificPCCFee,
              subOrderName: `${companyName}_${formatTimestamp(
                bookingDisplayStart.getTime(),
              )}`,
              isLastTxOfPlan: index === normalizedOrderDetail.length - 1,
            },
          },
        },
        {
          include: ['provider'],
          expand: true,
        },
      );

      const [tx] = denormalisedResponseEntities(createTxResponse);
      const txGetter = Transaction(tx as TTransaction);

      const txId = Transaction(tx).getId() as string;
      const { provider } = txGetter.getFullData();

      createFirebaseDocNotification(ENotificationType.SUB_ORDER_INPROGRESS, {
        userId: User(provider).getId(),
        planId,
        orderId,
        transition: ETransition.INITIATE_TRANSACTION,
        subOrderDate: bookingStart.getTime(),
        subOrderName: `${companyName}_${formatTimestamp(
          bookingStart.getTime(),
        )}`,
      });

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

  // update VAT setting for partners
  const partnerListings = denormalisedResponseEntities(
    await integrationSdk.listings.query({
      ids: uniq(partnerIds),
    }),
  );
  const vatSettings = partnerListings.reduce(
    (res: TObject, partner: TListing) => {
      const partnerGetter = Listing(partner);
      const partnerId = partnerGetter.getId();

      const { vat = EPartnerVATSetting.vat } = partnerGetter.getPublicData();

      return {
        ...res,
        [partnerId]: vat,
      };
    },
    {},
  );

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      partnerIds: uniq(partnerIds),
      vatSettings,
    },
  });
};
