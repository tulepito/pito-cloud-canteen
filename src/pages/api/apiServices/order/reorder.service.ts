import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import { DateTime } from 'luxon';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import { isOrderDetailDatePickedFood } from '@helpers/orderHelper';
import { getInitMemberOrder } from '@pages/api/orders/[orderId]/plan/memberOrder.helper';
import { denormalisedResponseEntities } from '@services/data';
import { getOrderNumber, updateOrderNumber } from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing, User } from '@src/utils/data';
import {
  formatTimestamp,
  generateWeekDayList,
  getDaySessionFromDeliveryTime,
  renderDateRange,
} from '@src/utils/dates';
import {
  EBookerOrderDraftStates,
  EListingStates,
  EOrderDraftStates,
  EOrderType,
} from '@src/utils/enums';
import { INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION } from '@src/utils/options';
import type { TObject } from '@src/utils/types';

import { recommendRestaurants } from './recommendRestaurants/index.services';
import { checkRestaurantAvailableStatus } from './checkRestaurantAvailableStatus';

const ORDER_DETAIL_KEYS_TO_REMOVE = [
  'isPaid',
  'lastTransition',
  'transactionId',
];

const normalizeOrderMetadata = (metadata: TObject, newData: TObject) => {
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
    deadlineHour,
  } = metadata || {};
  const { daySession: newDaySession } = newData || {};

  const oldDaySession =
    daySession ||
    getDaySessionFromDeliveryTime(
      isEmpty(deliveryHour)
        ? undefined
        : deliveryHour.includes('-')
        ? deliveryHour.split('-')[0]
        : deliveryHour,
    );
  const newDeliveryHour =
    newDaySession === oldDaySession
      ? deliveryHour
      : INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION[newDaySession as TDaySession];

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
    deliveryHour: newDeliveryHour,
    daySession: newDaySession,
    deadlineHour,
    mealType,
  };

  return newOrderMetadata;
};

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
  const newOrderId = Listing(newOrder).getId();
  const isGroupOrder = orderType === EOrderType.group;
  const initialMemberOrder = getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  const plans = await Promise.all(
    oldPlans.map(async (id: string, index: number) => {
      const [oldPlan] = denormalisedResponseEntities(
        await integrationSdk.listings.show({ id }),
      );

      const { orderDetail: oldOrderDetail = {} } =
        Listing(oldPlan).getMetadata();

      // * find has restaurant & food from old order detail
      const hasRestaurantDateListFormOldPlan = Object.keys(
        oldOrderDetail,
      ).filter((date) => isOrderDetailDatePickedFood(oldOrderDetail[date]));
      const hasRestaurantDatesCount = hasRestaurantDateListFormOldPlan.length;

      let newOrderDetail = orderDatesInTimestamp.reduce(
        (result, currentDate, dateIdx) => {
          const weekDayOfDate = orderDatesWeekdayList[dateIdx];
          let dateToCopy: string | number =
            oldOrderDatesInTimestamp[
              oldOrderDatesWeekdayList.indexOf(weekDayOfDate)
            ];

          // * if week day not include in old week day list or empty order detail on date
          if (!dateToCopy || isEmpty(oldOrderDetail[dateToCopy])) {
            if (hasRestaurantDatesCount === 0) {
              return result;
            }

            dateToCopy =
              hasRestaurantDateListFormOldPlan[
                Math.floor(Math.random() * (hasRestaurantDatesCount - 1))
              ];
          }

          // * remove unnecessary info from old order detail on date
          const subOrderNeededData: TObject = omit(
            oldOrderDetail[dateToCopy],
            ORDER_DETAIL_KEYS_TO_REMOVE,
          );

          return {
            ...result,
            [`${currentDate}`]: {
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
      // * check available status
      const restaurantAvailableMap = await checkRestaurantAvailableStatus(
        newOrder,
        newOrderDetail,
      );
      const isAllDateUnAvailable = Object.keys(restaurantAvailableMap).every(
        (item) => !restaurantAvailableMap[item],
      );
      if (isAllDateUnAvailable) {
        newOrderDetail = await recommendRestaurants({
          orderId: newOrderId,
          shouldCalculateDistance: !isCreatedByAdmin,
        });
      }

      const newPlanResponse = await integrationSdk.listings.create({
        title: `${generatedOrderTitle} - Plan week ${index + 1}`,
        authorId: subAccountId,
        state: EListingStates.published,
        metadata: {
          ...Listing(oldPlan).getMetadata(),
          viewed: false,
          orderId: newOrderId,
          orderDetail: newOrderDetail,
        },
      });
      const [newPlan] = denormalisedResponseEntities(newPlanResponse);

      return newPlan?.id?.uuid;
    }),
  );

  const updatedOrder = await integrationSdk.listings.update(
    {
      id: newOrderId,
      metadata: {
        plans,
      },
    },
    { expand: true },
  );

  updateOrderNumber();

  return denormalisedResponseEntities(updatedOrder)[0];
};
