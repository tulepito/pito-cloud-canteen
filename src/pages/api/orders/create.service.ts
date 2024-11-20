import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import {
  calculateGroupMembers,
  ensureActiveUserIds,
  getAllCompanyMembers,
} from '@helpers/company';
import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import {
  createScheduler,
  getScheduler,
  updateScheduler,
  upsertAutomaticStartOrderScheduler,
  upsertPickFoodForEmptyMembersScheduler,
} from '@services/awsEventBrigdeScheduler';
import getAdminAccount, { updateOrderNumber } from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { formatTimestamp, VNTimezone } from '@src/utils/dates';
import { denormalisedResponseEntities, User } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EListingStates,
  EListingType,
  EOrderDraftStates,
  EOrderType,
} from '@utils/enums';
import type { TObject } from '@utils/types';

const createDeadlineScheduler = async ({
  deadlineDate,
  orderFlexId,
}: {
  deadlineDate: number;
  orderFlexId: string;
}) => {
  const reminderTime = DateTime.fromMillis(deadlineDate)
    .setZone(VNTimezone)
    .minus({
      minutes:
        +process.env
          .NEXT_PUBLIC_SEND_REMIND_PICKING_ORDER_TIME_TO_DEADLINE_IN_MINUTES,
    })
    .toMillis();
  try {
    await getScheduler(`sendRemindPOE${orderFlexId}`);
    await updateScheduler({
      customName: `sendRemindPOE${orderFlexId}`,
      timeExpression: formatTimestamp(reminderTime, "yyyy-MM-dd'T'HH:mm:ss"),
      arn: process.env.LAMBDA_ARN,
    });
  } catch (error) {
    console.error('create scheduler in create order');
    await createScheduler({
      customName: `sendRemindPOE${orderFlexId}`,
      timeExpression: formatTimestamp(reminderTime, "yyyy-MM-dd'T'HH:mm:ss"),
      arn: process.env.LAMBDA_ARN,
      params: {
        orderId: orderFlexId,
      },
    });
  }
};

const createOrder = async ({
  companyId,
  bookerId,
  isCreatedByAdmin,
  generalInfo = {},
}: {
  companyId: string;
  bookerId: string;
  isCreatedByAdmin: boolean;
  generalInfo?: TObject;
}) => {
  const integrationSdk = getIntegrationSdk();
  const updatedAt = new Date().getTime();

  // Count order number
  const adminAccount = await getAdminAccount();

  const { currentOrderNumber = 0 } = adminAccount.attributes.profile.metadata;

  updateOrderNumber();

  // Get sub account id
  const companyAccount = await fetchUser(companyId);

  const { subAccountId } = companyAccount.attributes.profile.privateData;
  const { companyName } = companyAccount.attributes.profile.publicData;

  const generatedOrderId = `PT${generateUncountableIdForOrder(
    currentOrderNumber,
  )}`;

  // Prepare order state history
  const orderStateHistory = [
    {
      state: isCreatedByAdmin
        ? EOrderDraftStates.draft
        : EBookerOrderDraftStates.bookerDraft,
      updatedAt,
    },
  ];

  // Prepare general info
  const {
    deliveryAddress,
    deliveryHour,
    deadlineHour,
    nutritions,
    selectedGroups = ['allMembers'],
    packagePerMember,
    dayInWeek,
    startDate,
    endDate,
    memberAmount,
    deadlineDate,
    mealType,
    orderType = EOrderType.group,
    daySession,
  } = generalInfo;

  const isNormalOrder = orderType === EOrderType.normal;
  const shouldUpdateOrderName = startDate && endDate;

  const participants: string[] = isEmpty(selectedGroups)
    ? await ensureActiveUserIds(getAllCompanyMembers(companyAccount))
    : await ensureActiveUserIds(
        calculateGroupMembers(companyAccount, selectedGroups),
      );
  const groupOrderInfoMaybe = isNormalOrder
    ? {}
    : { participants, selectedGroups, deadlineDate, deadlineHour };

  const booker = await fetchUser(bookerId);
  const bookerUser = User(booker);
  const { isAutoPickFood } = bookerUser.getPublicData();

  // Call api to create order listing
  const orderListingResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: generatedOrderId,
      state: EListingStates.published,
      metadata: {
        companyId,
        bookerId,
        memberAmount,
        orderType,
        listingType: EListingType.order,
        orderState: isCreatedByAdmin
          ? EOrderDraftStates.draft
          : EBookerOrderDraftStates.bookerDraft,
        orderStateHistory,
        deliveryAddress,
        deliveryHour,
        ...groupOrderInfoMaybe,
        nutritions,
        packagePerMember,
        dayInWeek,
        startDate,
        endDate,
        mealType,
        companyName,
        daySession,
        isAutoPickFood,
      },
      ...(shouldUpdateOrderName
        ? {
            publicData: {
              companyName,
              orderName: `${companyName}_${formatTimestamp(
                generalInfo.startDate,
              )} - ${formatTimestamp(generalInfo.endDate)}`,
            },
          }
        : {}),
    },
    { expand: true },
  );
  const orderListing = denormalisedResponseEntities(orderListingResponse)[0];
  const orderFlexId = orderListing.id.uuid;

  if (!isNormalOrder && deadlineDate) {
    createDeadlineScheduler({ deadlineDate, orderFlexId });
  }

  if (!isNormalOrder && orderFlexId) {
    upsertAutomaticStartOrderScheduler({
      orderId: orderFlexId,
      startDate,
      deliveryHour,
    });
  }

  if (isAutoPickFood && !isNormalOrder && orderFlexId) {
    await upsertPickFoodForEmptyMembersScheduler({
      orderId: orderFlexId,
      deadlineDate,
      params: {
        orderId: orderFlexId,
      },
    });
  }

  return orderListing;
};

export default createOrder;
