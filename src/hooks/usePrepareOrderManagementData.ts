import { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import type { TReviewInfoFormValues } from '@components/OrderDetails/ReviewView/ReviewInfoSection/ReviewInfoForm';
import { parseThousandNumber } from '@helpers/format';
import { calculatePriceQuotationInfo } from '@helpers/order/cartInfoHelper';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { isEnableToStartOrder } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { Listing, User } from '@utils/data';
import { EOrderStates, EOrderType } from '@utils/enums';
import type { TCurrentUser, TListing, TObject, TUser } from '@utils/types';

export const usePrepareOrderDetailPageData = ({
  date,
  VATPercentage,
  serviceFeePercentage,
}: {
  date?: string | number;
  VATPercentage?: number;
  serviceFeePercentage?: number;
}) => {
  const router = useRouter();
  const [reviewInfoValues, setReviewInfoValues] =
    useState<TReviewInfoFormValues>();

  const {
    orderData,
    planData,
    participantData,
    anonymousParticipantData,
    companyData,
    bookerData,
    transactionDataMap,
  } = useAppSelector((state) => state.OrderManagement);

  const currentOrderVATPercentage = useAppSelector(
    (state) => state.Order.currentOrderVATPercentage,
  );
  const currentUser = useAppSelector(currentUserSelector);

  const { title: orderTitle = '' } = Listing(
    orderData as TListing,
  ).getAttributes();
  const constCurrUserAttributes = User(
    currentUser as TCurrentUser,
  ).getAttributes();
  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();
  const { companyName = '' } = User(companyData as TUser).getPublicData();

  const {
    email: bookerEmail,
    profile: {
      displayName: contactPeopleName = '',
      protectedData: { phoneNumber: protectedContactPhoneNumber = '' } = {},
      publicData: { phoneNumber: publicContactPhoneNumber = '' } = {},
    },
  } =
    bookerData !== null
      ? User(bookerData).getAttributes()
      : constCurrUserAttributes;

  const {
    startDate = 0,
    endDate = 0,
    deliveryHour,
    deliveryAddress,
    deadlineDate = 0,
    deadlineHour,
    // packagePerMember = 0,
    participants = [],
    anonymous = [],
    staffName = '',
    orderState,
    ratings,
    orderType = EOrderType.group,
  } = Listing(orderData as TListing).getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const isCanceledOrder = [
    EOrderStates.canceled || EOrderStates.canceledByBooker,
  ].includes(orderState);
  const canStartOrder = isEnableToStartOrder(orderDetail, isGroupOrder);
  const canReview =
    orderState === EOrderStates.completed ||
    (orderState === EOrderStates.pendingPayment && !ratings);
  const titleSectionData = {
    deliveryHour,
    deliveryAddress,
    canStartOrder,
  };
  const countdownSectionData = {
    deadlineHour,
    orderDeadline: deadlineDate,
    startDate,
  };
  const linkSectionData = { orderDeadline: deadlineDate, companyName };
  const manageParticipantData = {
    planData,
    participants,
    participantData,
  };
  const manageOrdersData = {
    startDate,
    endDate,
  };
  /* =============== Edit data =============== */
  const editViewData = {
    titleSectionData,
    countdownSectionData,
    linkSectionData,
    manageParticipantData,
    manageOrdersData,
  };
  /* =============== Review data =============== */
  const foodOrderGroupedByDate = groupFoodOrderByDate({
    orderDetail,
    isGroupOrder,
    date,
  });
  const {
    totalPrice,
    PITOPoints,
    VATFee,
    totalWithVAT,
    serviceFee,
    transportFee,
    promotion,
    overflow,
    PITOFee,
    totalWithoutVAT,
  } = calculatePriceQuotationInfo({
    planOrderDetail: orderDetail,
    order: orderData as TObject,
    currentOrderVATPercentage: VATPercentage!
      ? VATPercentage!
      : currentOrderVATPercentage,
    currentOrderServiceFeePercentage: serviceFeePercentage,
    date,
    shouldIncludePITOFee: isEmpty(date),
  });

  const reviewInfoData = {
    reviewInfoValues,
    deliveryHour,
    deliveryAddress: deliveryAddress?.address || '',
    staffName,
    companyName,
    contactPeopleName,
    contactPeopleEmail: bookerEmail,
    contactPhoneNumber: protectedContactPhoneNumber || publicContactPhoneNumber,
  };

  const reviewResultData = {
    participants,
    participantData,
    anonymous,
    anonymousParticipantData,
    orderDetail,
  };
  const reviewCartData = {
    overflow,
    PITOPoints,
    promotion,
    serviceFee,
    totalPrice,
    totalWithoutVAT,
    totalWithVAT,
    transportFee,
    VATFee,
    PITOFee,
  };
  const reviewViewData = {
    isGroupOrder,
    orderTitle,
    reviewInfoData,
    reviewResultData,
    reviewCartData,
    foodOrderGroupedByDate,
    isCanceledOrder,
    transactionDataMap,
  };

  /* =============== Price quotation data =============== */
  const priceQuotationData = {
    customerData: {
      ...(reviewInfoValues || reviewInfoData),
      email: bookerEmail,
    },
    orderData: {
      orderTitle,
      companyName,
      startDate,
      endDate,
    },
    cartData: {
      serviceFee: `${parseThousandNumber(serviceFee)}đ`,
      totalPrice: `${parseThousandNumber(totalPrice)}đ`,
      promotion: `${parseThousandNumber(promotion)}đ`,
      totalWithVAT: `${parseThousandNumber(totalWithVAT)}đ`,
      transportFee: `${parseThousandNumber(transportFee)}đ`,
      VATFee: `${parseThousandNumber(VATFee)}đ`,
      PITOFee: `${parseThousandNumber(PITOFee)}đ`,
      currentOrderVATPercentage: !isEmpty(VATPercentage)
        ? VATPercentage!
        : currentOrderVATPercentage,
    },
    orderDetailData: {
      foodOrderGroupedByDate,
    },
  };
  console.debug(
    '💫 > file: usePrepareOrderManagementData.ts:211 > priceQuotationData: ',
    priceQuotationData,
  );

  const goToReviewPage = () => {
    router.push({
      pathname: companyPaths.OrderRating,
      query: { orderId: orderData?.id.uuid },
    });
  };

  return {
    canReview,
    goToReviewPage,
    orderTitle,
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  };
};
