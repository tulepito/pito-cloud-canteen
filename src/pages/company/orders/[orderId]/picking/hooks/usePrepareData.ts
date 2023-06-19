import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type { TReviewInfoFormValues } from '@components/OrderDetails/ReviewView/ReviewInfoSection/ReviewInfoForm';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { Listing, User } from '@utils/data';
import { EOrderStates } from '@utils/enums';
import type { TCurrentUser, TListing, TObject, TUser } from '@utils/types';

import {
  calculatePriceQuotationInfo,
  calculatePriceQuotationInfoFromQuotation,
} from '../helpers/cartInfoHelper';
import {
  groupFoodOrderByDate,
  groupFoodOrderByDateFromQuotation,
} from '../helpers/orderDetailHelper';

export const usePrepareOrderDetailPageData = () => {
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
    quotation,
  } = useAppSelector((state) => state.OrderManagement);
  const currentUser = useAppSelector(currentUserSelector);

  const { title: orderTitle = '' } = Listing(
    orderData as TListing,
  ).getAttributes();
  const constCurrUserAttributes = User(
    currentUser as TCurrentUser,
  ).getAttributes();
  const { orderDetail } = Listing(planData as TListing).getMetadata();
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
    packagePerMember = 0,
    participants = [],
    anonymous = [],
    staffName = '',
    orderState,
    ratings,
  } = Listing(orderData as TListing).getMetadata();
  const isCanceledOrder = [
    EOrderStates.canceled || EOrderStates.canceledByBooker,
  ].includes(orderState);
  const isOrderIsPicking = orderState === EOrderStates.picking;
  const canReview =
    orderState === EOrderStates.completed ||
    (orderState === EOrderStates.pendingPayment && !ratings);
  const titleSectionData = { deliveryHour, deliveryAddress };
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
  const foodOrderGroupedByDateFromOrderDetail = useMemo(
    () =>
      groupFoodOrderByDate({
        orderDetail,
      }),
    [orderDetail],
  );
  const foodOrderGroupedByDateFromQuotation = useMemo(
    () =>
      groupFoodOrderByDateFromQuotation({
        quotation: quotation as TListing,
      }),
    [JSON.stringify(quotation)],
  );
  const foodOrderGroupedByDate = isOrderIsPicking
    ? foodOrderGroupedByDateFromOrderDetail
    : foodOrderGroupedByDateFromQuotation;
  const quotationInfo = useMemo(
    () =>
      calculatePriceQuotationInfo({
        planOrderDetail: orderDetail,
        order: orderData as TObject,
      }),
    [orderData, orderDetail],
  );
  const quotationInfor = useMemo(
    () =>
      calculatePriceQuotationInfoFromQuotation({
        quotation: quotation as TListing,
        packagePerMember,
      }),
    [packagePerMember, quotation],
  );

  const {
    totalPrice = 0,
    PITOPoints = 0,
    VATFee = 0,
    totalWithVAT = 0,
    serviceFee = 0,
    transportFee = 0,
    promotion = 0,
    overflow,
    PITOFee = 0,
    totalWithoutVAT = 0,
  } = isOrderIsPicking ? quotationInfo : quotationInfor;

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
    },
    orderDetailData: {
      foodOrderGroupedByDate,
    },
  };

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
    orderData,
  };
};
