import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import config from '@src/configs';
import { Listing, User } from '@utils/data';
import type { TListing, TUser } from '@utils/types';
import { useState } from 'react';

import type { TReviewInfoFormValues } from '../components/BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoForm';
import { calculateTotalPriceAndDishes } from '../helpers/cartInfoHelper';
import { groupFoodOrderByDate } from '../helpers/orderDetailHelper';

export const usePrepareOrderDetailPageData = () => {
  const [reviewInfoValues, setReviewInfoValues] =
    useState<TReviewInfoFormValues>();

  const { orderData, planData, participantData, companyData } = useAppSelector(
    (state) => state.OrderManagement,
  );
  const currentUser = useAppSelector(currentUserSelector);

  const { title: orderTitle = '' } = Listing(
    orderData as TListing,
  ).getAttributes();
  const { email: bookerEmail } = User(currentUser as TUser).getAttributes();
  const { orderDetail } = Listing(planData as TListing).getMetadata();
  const { companyName } = User(companyData as TUser).getPublicData();
  const {
    startDate = 0,
    endDate = 0,
    deliveryHour,
    deliveryAddress,
    orderDeadline = 0,
    deadlineHour,
    staffName,
    packagePerMember = 0,
    participants = [],
  } = Listing(orderData as TListing).getMetadata();

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
  const totalInfo = calculateTotalPriceAndDishes({ orderDetail });
  const foodOrderGroupedByDate = groupFoodOrderByDate({ orderDetail });

  const { totalPrice = 0, totalDishes = 0 } = totalInfo || {};
  const PITOPoints = totalPrice / 100000;
  const isOverflowPackage = totalDishes * packagePerMember < totalPrice;

  const VATFee = totalPrice * config.VATPercentage;
  const serviceFee = 0;
  const transportFee = 0;
  const promotion = 0;
  const totalWithoutVAT = totalPrice + serviceFee + transportFee - promotion;
  const totalWithVAT = VATFee + totalWithoutVAT;
  const overflow = isOverflowPackage
    ? totalWithVAT - totalDishes * packagePerMember
    : 0;

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
