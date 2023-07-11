/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import type { TReviewInfoFormValues } from '@components/OrderDetails/ReviewView/ReviewInfoSection/ReviewInfoForm';
import { parseThousandNumber } from '@helpers/format';
import {
  calculatePriceQuotationInfo,
  calculatePriceQuotationInfoFromQuotation,
} from '@helpers/order/cartInfoHelper';
import {
  groupFoodOrderByDate,
  groupFoodOrderByDateFromQuotation,
} from '@helpers/order/orderDetailHelper';
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
}: {
  date?: string | number;
  VATPercentage?: number;
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
    quotation,
    draftOrderDetail,
    draftSubOrderChangesHistory,
  } = useAppSelector((state) => state.OrderManagement);

  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
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
    packagePerMember = 0,
    participants = [],
    anonymous = [],
    staffName = '',
    orderState,
    ratings,
    orderType = EOrderType.group,
    orderNote = '',
  } = Listing(orderData as TListing).getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const isCanceledOrder = [
    EOrderStates.canceled || EOrderStates.canceledByBooker,
  ].includes(orderState);
  const canStartOrder = isEnableToStartOrder(orderDetail, isGroupOrder);
  const isOrderIsPicking = orderState === EOrderStates.picking;
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
  const isOrderEditing = !isEmpty(draftSubOrderChangesHistory);
  const foodOrderGroupedByDateFromOrderDetail = useMemo(
    () =>
      groupFoodOrderByDate({
        orderDetail,
        isGroupOrder,
      }),
    [orderDetail, isGroupOrder],
  );
  const foodOrderGroupedByDateFromQuotation = useMemo(
    () =>
      groupFoodOrderByDateFromQuotation({
        quotation: quotation as TListing,
      }),
    [JSON.stringify(quotation)],
  );
  const foodOrderGroupedByDateFromDraftOrderDetail = useMemo(
    () =>
      groupFoodOrderByDate({
        orderDetail: draftOrderDetail,
        isGroupOrder,
      }),
    [JSON.stringify(draftOrderDetail), isGroupOrder],
  );

  const foodOrderGroupedByDate = isOrderIsPicking
    ? foodOrderGroupedByDateFromOrderDetail
    : isOrderEditing
    ? foodOrderGroupedByDateFromDraftOrderDetail
    : foodOrderGroupedByDateFromQuotation;
  const quotationInfo = useMemo(
    () =>
      calculatePriceQuotationInfo({
        planOrderDetail: orderDetail,
        order: orderData as TObject,
        currentOrderVATPercentage: !isEmpty(VATPercentage)
          ? VATPercentage!
          : currentOrderVATPercentage,
        date,
        shouldIncludePITOFee: isEmpty(date),
      }),
    [orderData, orderDetail, currentOrderVATPercentage],
  );
  const quotationDraftInfor = useMemo(
    () =>
      calculatePriceQuotationInfo({
        planOrderDetail: draftOrderDetail,
        order: orderData as TObject,
        currentOrderVATPercentage,
      }),
    [orderData, draftOrderDetail, currentOrderVATPercentage],
  );

  const quotationInfor = useMemo(
    () =>
      calculatePriceQuotationInfoFromQuotation({
        quotation: quotation as TListing,
        packagePerMember,
        currentOrderVATPercentage,
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
  } = isOrderIsPicking
    ? quotationInfo
    : isOrderEditing
    ? quotationDraftInfor
    : quotationInfor;
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
    orderDetail: isOrderEditing ? draftOrderDetail : orderDetail,
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
    orderNoteData: {
      orderNote,
      disabled: orderState !== EOrderStates.picking,
    },
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
      currentOrderVATPercentage,
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
