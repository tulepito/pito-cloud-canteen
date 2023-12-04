import { getPickFoodParticipants } from '@helpers/orderHelper';
import { pushNativeNotificationOrderDetail } from '@pages/api/helpers/pushNotificationOrderDetailHelper';
import { createOrUpdatePickFoodForEmptyMembersScheduler } from '@services/awsEventBrigdeScheduler';
import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import getSystemAttributes from '@services/getSystemAttributes';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createNativeNotification } from '@services/nativeNotification';
import { Listing, User } from '@utils/data';
import { ENativeNotificationType, EOrderStates } from '@utils/enums';

export const startOrder = async (orderId: string, planId: string) => {
  const integrationSdk = getIntegrationSdk();

  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: orderId,
    }),
  );
  const {
    companyId,
    bookerId,
    orderState,
    orderStateHistory = [],
    partnerIds = [],
    hasSpecificPCCFee: orderHasSpecificPCCFee,
    specificPCCFee: orderSpecificPCCFee,
    startDate,
    deliveryHour,
  } = Listing(orderListing).getMetadata();

  if (orderState !== EOrderStates.picking) {
    throw new Error(
      'You can start picking order (with orderState is "picking") only',
    );
  }
  const booker = await fetchUser(bookerId);
  const bookerUser = User(booker);
  const { isAutoPickFood } = bookerUser.getPublicData();

  const updateOrderStateHistory = orderStateHistory.concat([
    {
      state: EOrderStates.inProgress,
      updatedAt: new Date().getTime(),
    },
  ]);
  const { systemVATPercentage = 0 } = await getSystemAttributes();
  const companyUser = await fetchUser(companyId);
  const { hasSpecificPCCFee = false, specificPCCFee = 0 } =
    User(companyUser).getMetadata();

  // TODO: update state, save vat and PCC fee in order listing
  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: EOrderStates.inProgress,
      orderStateHistory: updateOrderStateHistory,
      orderVATPercentage: systemVATPercentage,
      ...(orderHasSpecificPCCFee === undefined &&
        orderSpecificPCCFee === undefined && {
          hasSpecificPCCFee,
          specificPCCFee,
        }),
    },
  });

  const [plan] = denormalisedResponseEntities(
    await integrationSdk.listings.update(
      {
        id: planId,
        metadata: {
          partnerIds,
        },
      },
      {
        expand: true,
      },
    ),
  );
  const planListing = Listing(plan);
  const { orderDetail = {} } = planListing.getMetadata();

  const shouldSendNativeNotificationParticipantIdList =
    getPickFoodParticipants(orderDetail);

  // TODO: send noti email
  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ORDER_SUCCESS, {
    orderId,
  });

  shouldSendNativeNotificationParticipantIdList.map(
    async (participantId: string) => {
      createNativeNotification(
        ENativeNotificationType.BookerTransitOrderStateToInProgress,
        {
          participantId,
          order: orderListing,
        },
      );
    },
  );
  await pushNativeNotificationOrderDetail(
    orderDetail,
    orderListing,
    ENativeNotificationType.BookerTransitOrderStateToInProgress,
    integrationSdk,
  );

  if (isAutoPickFood) {
    await createOrUpdatePickFoodForEmptyMembersScheduler({
      orderId,
      startDate,
      deliveryHour,
    });
  }
};
