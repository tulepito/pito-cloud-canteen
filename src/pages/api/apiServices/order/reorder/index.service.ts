import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import { getInitMemberOrder } from '@pages/api/orders/[orderId]/plan/memberOrder.helper';
import { upsertAutomaticStartOrderScheduler } from '@services/awsEventBrigdeScheduler';
import { denormalisedResponseEntities } from '@services/data';
import { getOrderNumber, updateOrderNumber } from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing, User } from '@src/utils/data';
import {
  convertWeekDay,
  formatTimestamp,
  generateWeekDayList,
  getDayInWeekFromPeriod,
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

  const orderName = `${companyName}_${formatTimestamp(
    startDate,
  )} - ${formatTimestamp(endDate)}`;
  const normalizedOrderMetadata = normalizeOrderMetadata(oldOrderMetadata, {
    daySession,
  });
  const { deliveryHour, deadlineHour } = normalizedOrderMetadata;
  const initialDeadlineDate = DateTime.fromMillis(startDate)
    .setZone('Asia/Ho_Chi_Minh')
    .plus({
      ...convertHHmmStringToTimeParts(
        isEmpty(deadlineHour) ? undefined : deadlineHour,
      ),
    })
    .minus({ day: 2 })
    .toMillis();

  const timestampWeekDays = getDayInWeekFromPeriod(startDate, endDate).map(
    (day) => convertWeekDay(day).key,
  );

  const canAddSecondaryFood = oldOrderMetadata.canAddSecondaryFood;

  const newOrderResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: generatedOrderTitle,
      state: EListingStates.published,
      publicData: {
        companyName,
        orderName,
      },
      metadata: {
        bookerId,
        orderStateHistory,
        orderState,
        companyName,
        ...normalizedOrderMetadata,
        startDate,
        endDate,
        deadlineDate: initialDeadlineDate,
        dayInWeek: timestampWeekDays,
        ...(canAddSecondaryFood ? { canAddSecondaryFood } : {}),
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
  const initialMemberOrder = await getInitMemberOrder({
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

  if (isGroupOrder && !isCreatedByAdmin && newOrderId) {
    upsertAutomaticStartOrderScheduler({
      orderId: newOrderId,
      startDate,
      deliveryHour,
    });
  }

  return denormalisedResponseEntities(updatedOrder)[0];
};
