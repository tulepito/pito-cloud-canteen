/* eslint-disable @typescript-eslint/no-shadow */
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { EImageVariants, EOrderStates } from '@utils/enums';
import type { TPlan } from '@utils/orderTypes';
import type { TObject } from '@utils/types';
import isEmpty from 'lodash/isEmpty';

const getOrder = async ({ orderId }: { orderId: string }) => {
  const integrationSdk = getIntegrationSdk();

  const orderResponse = await integrationSdk.listings.show({
    id: orderId,
  });
  const [orderListing] = denormalisedResponseEntities(orderResponse);
  const {
    plans = [],
    companyId,
    participants = [],
    anonymous = [],
    bookerId = '',
    orderState,
  } = Listing(orderListing).getMetadata();

  const companyResponse = await integrationSdk.users.show({
    id: companyId,
  });
  const [companyUser] = denormalisedResponseEntities(companyResponse);

  let data: TObject = { companyId, companyData: companyUser, orderListing };
  const participantData = await Promise.all(
    participants.map(async (id: string) => {
      const [memberAccount] = denormalisedResponseEntities(
        await integrationSdk.users.show({
          id,
          include: ['profileImage'],
          'fields.image': [
            `variants.${EImageVariants.squareSmall}`,
            `variants.${EImageVariants.squareSmall2x}`,
          ],
        }),
      );

      return memberAccount;
    }),
  );
  const anonymousParticipantData = await Promise.all(
    anonymous.map(async (id: string) => {
      const [memberAccount] = denormalisedResponseEntities(
        await integrationSdk.users.show({
          id,
        }),
      );

      return memberAccount;
    }),
  );

  data = { ...data, participantData, anonymousParticipantData };

  if (plans?.length > 0) {
    const planId = plans[0];
    const [planListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    );

    data = { ...data, planListing };

    const { orderDetail } = Listing(planListing).getMetadata();

    if (
      [
        EOrderStates.inProgress,
        EOrderStates.pendingPayment,
        EOrderStates.completed,
        EOrderStates.reviewed,
      ].includes(orderState)
    ) {
      const transactionIdMap = Object.entries<
        TPlan['orderDetail'][keyof TPlan['orderDetail']]
      >(orderDetail).reduce<{ timestamp: string; transactionId: string }[]>(
        (prev, [timestamp, { transactionId }]) => {
          if (transactionId) return prev.concat([{ timestamp, transactionId }]);

          return prev;
        },
        [],
      );

      const transactionDataMap: TObject = {};
      await Promise.all(
        transactionIdMap.map(async ({ timestamp, transactionId }) => {
          const [tx] = denormalisedResponseEntities(
            await integrationSdk.transactions.show({
              id: transactionId,
            }),
          );

          transactionDataMap[timestamp] = tx;
        }),
      );

      data = { ...data, transactionDataMap };
    }
  }

  if (!isEmpty(bookerId)) {
    const [bookerData] = denormalisedResponseEntities(
      await integrationSdk.users.show({
        id: bookerId,
      }),
    );

    data = { ...data, bookerData };
  }

  return data;
};

export default getOrder;
