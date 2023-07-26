import { parseThousandNumber } from '@helpers/format';
import { groupFoodOrderByDateFromQuotation } from '@helpers/order/orderDetailHelper';
import { Listing, User } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type {
  TListing,
  TObject,
  TPaymentRecord,
  TUser,
} from '@src/utils/types';

export const formatQuotationToFoodTableData = (
  quotationDetail: any,
  restaurantId: string,
) => {
  const restaurantQuotation = quotationDetail[restaurantId];

  const foodTableData = Object.keys(restaurantQuotation?.quotation).map(
    (date: string, index: number) => {
      const foodDataList = restaurantQuotation?.quotation[date];
      const summary = foodDataList.reduce(
        (previousResult: TObject, current: TObject) => {
          const { totalPrice, totalDishes } = previousResult;
          const { frequency, foodPrice } = current;

          return {
            ...previousResult,
            totalDishes: totalDishes + frequency,
            totalPrice: totalPrice + foodPrice * frequency,
          };
        },
        {
          totalDishes: 0,
          totalPrice: 0,
        } as TObject,
      );

      return {
        date: Number(date),
        index,
        foodDataList,
        ...summary,
      };
    },
  );

  return foodTableData;
};

export const relatedOrderDataSource = ({
  company,
  booker,
  order,
}: {
  company: TUser;
  booker: TUser;
  order: TListing;
}) => {
  const orderListing = Listing(order);
  const companyUser = User(company);
  const bookerUser = User(booker);

  const orderTitle = orderListing.getAttributes().title;
  const { companyName } = companyUser.getPublicData();
  const { displayName } = bookerUser.getProfile();
  const { email: bookerEmail } = bookerUser.getAttributes();
  const { phoneNumber: bookerPhoneNumber } = bookerUser.getProtectedData();
  const {
    deliveryAddress,
    staffName,
    startDate,
    endDate,
    orderType = EOrderType.group,
  } = orderListing.getMetadata();

  return {
    orderTitle,
    companyName,
    startDate,
    endDate,
    bookerName: displayName,
    bookerEmail,
    bookerPhoneNumber,
    staffName,
    deliveryAddress: deliveryAddress?.address,
    isGroupOrder: orderType === EOrderType.group,
  };
};

export const formatPriceQuotationData = ({
  company,
  booker,
  order,
  priceQuotation,
  currentOrderVATPercentage,
  quotation,
}: {
  company: TUser;
  booker: TUser;
  order: TListing;
  priceQuotation: TObject;
  currentOrderVATPercentage: number;
  quotation?: TListing;
}) => {
  const {
    orderTitle,
    companyName,
    startDate,
    endDate,
    bookerName,
    bookerEmail,
    bookerPhoneNumber,
    staffName,
    deliveryAddress,
  } = relatedOrderDataSource({
    company,
    booker,
    order,
  });

  const {
    serviceFee,
    totalPrice,
    promotion,
    totalWithVAT,
    transportFee,
    VATFee,
    PITOFee,
  } = priceQuotation;

  const customerData = {
    companyName,
    contactPeopleName: bookerName,
    contactPhoneNumber: bookerPhoneNumber || '',
    staffName,
    deliveryAddress,
    email: bookerEmail,
  };

  return {
    customerData,
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
      foodOrderGroupedByDate: groupFoodOrderByDateFromQuotation({
        quotation: quotation!,
      }),
    },
  };
};

export const formatPriceQuotationDataPartner = ({
  company,
  booker,
  order,
  priceQuotation,
  restaurantId,
  quotationDetail,
  currentOrderVATPercentage,
}: {
  company: TUser;
  booker: TUser;
  order: TListing;
  priceQuotation: TObject;
  restaurantId: string;
  quotationDetail: TObject;
  currentOrderVATPercentage: number;
}) => {
  const {
    orderTitle,
    companyName,
    startDate,
    endDate,
    bookerName,
    bookerEmail,
    bookerPhoneNumber,
    staffName,
    deliveryAddress,
  } = relatedOrderDataSource({
    company,
    booker,
    order,
  });

  const {
    serviceFee = 0,
    totalPrice,
    promotion,
    totalWithVAT,
    VATFee,
    serviceFeePrice,
  } = priceQuotation;

  const customerData = {
    companyName,
    contactPeopleName: bookerName,
    contactPhoneNumber: bookerPhoneNumber || '',
    staffName,
    deliveryAddress,
    email: bookerEmail,
  };

  return {
    customerData,
    orderData: {
      orderTitle,
      companyName,
      startDate,
      endDate,
    },
    cartData: {
      serviceFee: `${parseThousandNumber(serviceFee)}đ`,
      serviceFeePrice: `${parseThousandNumber(serviceFeePrice)}đ`,
      totalPrice: `${parseThousandNumber(totalPrice)}đ`,
      promotion: `${parseThousandNumber(promotion)}đ`,
      totalWithVAT: `${parseThousandNumber(totalWithVAT)}đ`,
      VATFee: `${parseThousandNumber(VATFee)}đ`,
      currentOrderVATPercentage,
    },
    orderDetailData: {
      foodOrderGroupedByDate: formatQuotationToFoodTableData(
        quotationDetail,
        restaurantId,
      ),
    },
  };
};

export const calculatePaidAmountBySubOrderDate = (
  paymentRecords: TPaymentRecord[],
) => {
  return paymentRecords.reduce((previousResult, current) => {
    const { amount } = current;

    return previousResult + amount;
  }, 0);
};

export const generateSKU = (role: string, orderTitle: string) => {
  const random4DigitsNumber = Math.floor(1000 + Math.random() * 9000);

  return `${random4DigitsNumber}-${role}-${orderTitle}`;
};
