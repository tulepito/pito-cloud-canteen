import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import { calculateGroupMembers, getAllCompanyMembers } from '@helpers/company';
import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import {
  createScheduler,
  getScheduler,
  updateScheduler,
} from '@services/awsEventBrigdeScheduler';
import getAdminAccount, { updateOrderNumber } from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { formatTimestamp, VNTimezone } from '@src/utils/dates';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EListingStates,
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
      minutes: 30,
    })
    .toMillis();
  try {
    await getScheduler(`sendRemindPOE_${orderFlexId}`);
    await updateScheduler({
      customName: `sendRemindPOE_${orderFlexId}`,
      timeExpression: formatTimestamp(reminderTime, "yyyy-MM-dd'T'hh:mm:ss"),
    });
  } catch (error) {
    console.error('create scheduler in create order');
    await createScheduler({
      customName: `sendRemindPOE_${orderFlexId}`,
      timeExpression: formatTimestamp(reminderTime, "yyyy-MM-dd'T'hh:mm:ss"),
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

  const orderId = generateUncountableIdForOrder(currentOrderNumber);
  const generatedOrderId = `PT${orderId}`;

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
    ? getAllCompanyMembers(companyAccount)
    : calculateGroupMembers(companyAccount, selectedGroups);
  const groupOrderInfoMaybe = isNormalOrder
    ? {}
    : { participants, selectedGroups, deadlineDate, deadlineHour };

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
        listingType: ListingTypes.ORDER,
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

  return orderListing;
};

export default createOrder;
