import omit from 'lodash/omit';

import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import { getInitMemberOrder } from '@pages/api/orders/[orderId]/plan/memberOrder.helper';
import { denormalisedResponseEntities } from '@services/data';
import { getOrderNumber, updateOrderNumber } from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing, User } from '@src/utils/data';
import {
  formatTimestamp,
  generateWeekDayList,
  getDayOfWeek,
  getDaySessionFromDeliveryTime,
  renderDateRange,
} from '@src/utils/dates';
import {
  EBookerOrderDraftStates,
  EListingStates,
  EOrderDraftStates,
  EOrderType,
} from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

const normalizeOrderMetadata = (metadata: TObject = {}) => {
  const {
    companyId,
    vatSettings = {},
    serviceFees = {},
    listingType,
    dayInWeek,
    deliveryAddress,
    detailAddress,
    displayedDurationTime,
    durationTimeMode,
    memberAmount,
    notes,
    nutritions,
    orderType,
    orderVATPercentage,
    packagePerMember,
    participants,
    pickAllow,
    selectedGroups,
    shipperName,
    staffName,
    vatAllow,
    deliveryHour,
    daySession,
    mealType,
  } = metadata;

  const newOrderMetadata = {
    companyId,
    vatSettings,
    serviceFees,
    listingType,
    dayInWeek,
    deliveryAddress,
    detailAddress,
    displayedDurationTime,
    durationTimeMode,
    memberAmount,
    notes,
    nutritions,
    orderType,
    orderVATPercentage,
    packagePerMember,
    participants,
    pickAllow,
    selectedGroups,
    shipperName,
    staffName,
    vatAllow,
    deliveryHour,
    daySession:
      daySession || getDaySessionFromDeliveryTime(deliveryHour.split('-')[0]),
    mealType,
  };

  return newOrderMetadata;
};

export const reorder = async ({
  orderIdToReOrder,
  bookerId,
  isCreatedByAdmin,
  dateParams,
}: {
  orderIdToReOrder: string;
  bookerId: string;
  isCreatedByAdmin?: boolean;
  dateParams: {
    startDate: number;
    endDate: number;
    deadlineDate: number;
    deadlineHour: number;
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
  } = oldOrderMetadata;
  const isGroupOrder = orderType === EOrderType.group;
  const { startDate, endDate, deadlineDate, deadlineHour } = dateParams;

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

  const newOrderResponse = await integrationSdk.listings.create({
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
      ...normalizeOrderMetadata(oldOrderMetadata),
      startDate,
      endDate,
      deadlineDate,
      deadlineHour,
    },
  });

  const orderDatesInTimestamp = renderDateRange(startDate, endDate);
  const orderDatesWeekdayList = generateWeekDayList(startDate, endDate);

  const [newOrder] = denormalisedResponseEntities(newOrderResponse);
  const initialMemberOrder = getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  const plans = await Promise.all(
    oldPlans.map(async (id: string, index: number) => {
      const [oldPlan] = denormalisedResponseEntities(
        await integrationSdk.listings.show({ id }),
      );

      const { orderDetail = {} } = Listing(oldPlan).getMetadata();
      const updatedOrderDetail = Object.keys(orderDetail).reduce(
        (result, date) => {
          const subOrderNeededData = omit(orderDetail[date], [
            'isPaid',
            'lastTransition',
            'transactionId',
          ]);
          const weekDayOfOldDate = getDayOfWeek(+date);
          const newDate =
            orderDatesInTimestamp[
              orderDatesWeekdayList.indexOf(weekDayOfOldDate)
            ];

          if (!newDate) {
            return result;
          }

          return {
            ...result,
            [`${newDate}`]: {
              ...subOrderNeededData,
              memberOrders: isGroupOrder ? {} : initialMemberOrder,
              restaurant: {
                ...subOrderNeededData.restaurant,
                foodList: {},
              },
            },
          };
        },
        {},
      );
      const newPlanResponse = await integrationSdk.listings.create({
        title: `${generatedOrderTitle} - Plan week ${index + 1}`,
        authorId: subAccountId,
        state: EListingStates.published,
        metadata: {
          ...Listing(oldPlan).getMetadata(),
          viewed: false,
          orderId: Listing(newOrder).getId(),
          orderDetail: updatedOrderDetail,
        },
      });
      const [newPlan] = denormalisedResponseEntities(newPlanResponse);

      return newPlan?.id?.uuid;
    }),
  );

  const updatedOrder = await integrationSdk.listings.update(
    {
      id: Listing(newOrder).getId(),
      metadata: {
        plans,
      },
    },
    { expand: true },
  );

  updateOrderNumber();

  return denormalisedResponseEntities(updatedOrder)[0];
};
