import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { LISTING, USER } from '@utils/data';
import type { TListing, TObject, TUser } from '@utils/types';
import { useState } from 'react';

import type { TReviewInfoFormValues } from '../components/BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoForm';
import { calculatePriceQuotationInfo } from '../helpers/cartInfoHelper';
import { groupFoodOrderByDate } from '../helpers/orderDetailHelper';

export const usePrepareOrderDetailPageData = () => {
  const [reviewInfoValues, setReviewInfoValues] =
    useState<TReviewInfoFormValues>();

  const { orderData, planData, participantData, companyData } = useAppSelector(
    (state) => state.OrderManagement,
  );
  const currentUser = useAppSelector(currentUserSelector);

  const { title: orderTitle = '' } = LISTING(
    orderData as TListing,
  ).getAttributes();
  const { email: bookerEmail } = USER(currentUser as TUser).getAttributes();
  const { orderDetail } = LISTING(planData as TListing).getMetadata();
  const { companyName } = USER(companyData as TUser).getPublicData();
  const { generalInfo = {}, participants = [] } = LISTING(
    orderData as TListing,
  ).getMetadata();
  const {
    startDate = 0,
    endDate = 0,
    deliveryHour,
    deliveryAddress,
    orderDeadline = 0,
    deadlineHour,
    staffName,
  } = generalInfo || {};

  const titleSectionData = { deliveryHour, deliveryAddress };
  const countdownSectionData = { deadlineHour, orderDeadline, startDate };
  const linkSectionData = { orderDeadline };
  const manageParticipantData = {
    planData,
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
  const foodOrderGroupedByDate = groupFoodOrderByDate({ orderDetail });
  const {
    totalPrice,
    PITOPoints,
    VATFee,
    totalWithVAT,
    serviceFee,
    transportFee,
    promotion,
    overflow,
    totalWithoutVAT,
  } = calculatePriceQuotationInfo({
    planOrderDetail: orderDetail,
    order: orderData as TObject,
  });

  const reviewInfoData = {
    reviewInfoValues,
    deliveryAddress: deliveryAddress?.address,
    staffName,
    companyName,
  };

  const reviewResultData = {
    participantData,
    participants,
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
  };
  const reviewViewData = {
    orderTitle,
    reviewInfoData,
    reviewResultData,
    reviewCartData,
    foodOrderGroupedByDate,
  };

  /* =============== Price quotation data =============== */
  const priceQuotationData = {
    customerData: {
      ...(reviewInfoValues || {}),
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
    },
    orderDetailData: {
      foodOrderGroupedByDate,
    },
  };

  return {
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  };
};
