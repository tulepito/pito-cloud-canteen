import { DateTime } from 'luxon';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import { getInitMemberOrder } from '@pages/api/orders/[orderId]/plan/memberOrder.helper';
import { createOrUpdateAutomaticStartOrderScheduler } from '@services/awsEventBrigdeScheduler';
import { denormalisedResponseEntities } from '@services/data';
import { getOrderNumber, updateOrderNumber } from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing, User } from '@src/utils/data';
import {
  formatTimestamp,
  generateWeekDayList,
  renderDateRange,
} from '@src/utils/dates';
import {
  EBookerOrderDraftStates,
  EListingStates,
  EOrderDraftStates,
  EOrderType,
} from '@src/utils/enums';

import { createNewPlanFromOldPlans, normalizeOrderMetadata } from './helper';

export const reorder = async ({
  orderIdToReOrder,
  bookerId,
  isCreatedByAdmin,
  params,
}: {
  orderIdToReOrder: string;
  bookerId: string;
  isCreatedByAdmin?: boolean;
  params: {
    startDate: number;
    endDate: number;
    daySession?: TDaySession;
  };
}) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.show({
    id: orderIdToReOrder,
  });
  const [oldOrder] = denormalisedResponseEntities(response);
  const oldOrderMetadata = Listing(oldOrder).getMetadata();

  const {
    companyId,
    plans: oldPlans = [],
    orderType,
    selectedGroups = [],
    startDate: oldStartDate,
    endDate: oldEndDate,
  } = oldOrderMetadata;
  const isGroupOrder = orderType === EOrderType.group;
  const { startDate, endDate, daySession } = params;

  const companyAccount = await fetchUser(companyId);
  const currentOrderNumber = await getOrderNumber();
  const companyGetter = User(companyAccount);
  const { subAccountId } = companyGetter.getPrivateData();
  const { companyName } = companyGetter.getPublicData();

  const generatedOrderTitle = `PT${generateUncountableIdForOrder(
    currentOrderNumber,
  )}`;

  // Prepare order state history
  const orderState = isCreatedByAdmin
    ? EOrderDraftStates.draft
    : EBookerOrderDraftStates.bookerDraft;

  const orderStateHistory = [
    {
      state: orderState,
      updatedAt: new Date().getTime(),
    },
  ];

  const newOrderResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: generatedOrderTitle,
      state: EListingStates.published,
      publicData: {
        companyName,
        orderName: `${companyName}_${formatTimestamp(
          startDate,
        )} - ${formatTimestamp(endDate)}`,
      },
      metadata: {
        bookerId,
        orderStateHistory,
        orderState,
        companyName,
        ...normalizeOrderMetadata(oldOrderMetadata, {
          daySession,
        }),
        startDate,
        endDate,
        deadlineDate: DateTime.fromMillis(startDate)
          .setZone('Asia/Ho_Chi_Minh')
          .minus({ day: 2 })
          .toMillis(),
      },
    },
    { expand: true },
  );

  // * new order date list info
  const orderDatesInTimestamp = renderDateRange(startDate, endDate);
  const orderDatesWeekdayList = generateWeekDayList(startDate, endDate);
  // * old order date list info
  const oldOrderDatesInTimestamp = renderDateRange(oldStartDate, oldEndDate);
  const oldOrderDatesWeekdayList = generateWeekDayList(
    oldStartDate,
    oldEndDate,
  );
  const [newOrder] = denormalisedResponseEntities(newOrderResponse);
  const newOrderId = newOrder?.id?.uuid;
  const initialMemberOrder = getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  const newPlanIds = await createNewPlanFromOldPlans({
    newOrderId,
    newOrder,
    generatedOrderTitle,
    subAccountId,
    isCreatedByAdmin,
    oldPlans,
    integrationSdk,
    orderDatesInTimestamp,
    orderDatesWeekdayList,
    oldOrderDatesInTimestamp,
    oldOrderDatesWeekdayList,
    isGroupOrder,
    initialMemberOrder,
    oldOrderMetadata,
  });

  const updatedOrder = await integrationSdk.listings.update(
    {
      id: newOrderId,
      metadata: {
        plans: newPlanIds,
      },
    },
    { expand: true },
  );

  updateOrderNumber();

  const { deliveryHour } = oldOrderMetadata;
  if (isGroupOrder && !isCreatedByAdmin && newOrderId) {
    createOrUpdateAutomaticStartOrderScheduler({
      orderId: newOrderId,
      startDate,
      deliveryHour,
    });
  }

  return denormalisedResponseEntities(updatedOrder)[0];
};
