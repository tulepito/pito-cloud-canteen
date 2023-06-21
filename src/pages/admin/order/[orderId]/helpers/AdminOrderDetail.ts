import { parseThousandNumber } from '@helpers/format';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { Listing, User } from '@src/utils/data';
import type { TListing, TObject, TUser } from '@src/utils/types';

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
  const { deliveryAddress, staffName, startDate, endDate } =
    orderListing.getMetadata();

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
  };
};

export const formatPriceQuotationData = ({
  company,
  booker,
  order,
  priceQuotation,
  orderDetail,
}: {
  company: TUser;
  booker: TUser;
  order: TListing;
  priceQuotation: TObject;
  orderDetail: TObject;
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
    },
    orderDetailData: {
      foodOrderGroupedByDate: groupFoodOrderByDate({
        orderDetail: orderDetail!,
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
}: {
  company: TUser;
  booker: TUser;
  order: TListing;
  priceQuotation: TObject;
  restaurantId: string;
  quotationDetail: TObject;
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
    },
    orderDetailData: {
      foodOrderGroupedByDate: formatQuotationToFoodTableData(
        quotationDetail,
        restaurantId,
      ),
    },
  };
};
