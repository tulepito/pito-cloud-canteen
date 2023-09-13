import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { minusDays } from '@src/utils/dates';
import {
  ENotificationTypes,
  EOrderDraftStates,
  EOrderStates,
} from '@src/utils/enums';

const ORDER_QUERY_PARAMS_BY_NOTIFICATION_TYPE = {
  [ENotificationTypes.completedOrder]: {
    meta_orderState: `${[
      EOrderStates.pendingPayment,
      EOrderStates.reviewed,
      EOrderStates.completed,
    ].join(',')}`,
    sort: 'createdAt',
  },
  [ENotificationTypes.pickingOrder]: {
    meta_orderState: `${[EOrderStates.inProgress, EOrderStates.picking].join(
      ',',
    )}`,
    sort: 'createdAt',
  },
  [ENotificationTypes.draftOrder]: {
    meta_orderState: EOrderDraftStates.pendingApproval,
    sort: 'createdAt',
  },
  [ENotificationTypes.deadlineDueOrder]: {
    meta_orderState: `${EOrderStates.picking}`,
    meta_deadlineDate: `${minusDays(new Date(), 1).getTime()},`,
  },
};

const getCompanyNotifications = async (companyId: string) => {
  const integrationSdk = getIntegrationSdk();
  const orders = await Promise.all(
    Object.keys(ENotificationTypes).map(async (key) => {
      const notificationType =
        ENotificationTypes[key as keyof typeof ENotificationTypes];
      const params = ORDER_QUERY_PARAMS_BY_NOTIFICATION_TYPE[notificationType];
      const notificationResponse = await integrationSdk.listings.query({
        meta_companyId: companyId,
        page: 1,
        perPage: 1,
        ...params,
      });

      const [responseOrder] =
        denormalisedResponseEntities(notificationResponse);
      if (!responseOrder) return null;

      return {
        ...responseOrder,
        notificationType: key as ENotificationTypes,
      };
    }),
  );

  return orders.reduce((acc, order) => {
    if (!order?.notificationType) {
      return acc;
    }

    return {
      ...acc,
      [order.notificationType]: order,
    };
  }, {});
};
export default getCompanyNotifications;
