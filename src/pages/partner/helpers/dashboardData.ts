import uniq from 'lodash/uniq';

import {
  calculatePriceQuotationPartner,
  calculateTotalPriceAndDishes,
  vatPercentageBaseOnVatSetting,
} from '@helpers/order/cartInfoHelper';
import { Listing } from '@src/utils/data';
import { formatTimestamp, getTimePeriodBetweenDates } from '@src/utils/dates';
import {
  EOrderType,
  EPartnerVATSetting,
  ETimeFrame,
  ETimePeriodOption,
} from '@src/utils/enums';
import type { TChartPoint, TListing, TObject } from '@src/utils/types';

export const calculateOverviewInformation = (subOrders: TObject[]) => {
  const overviewInformation = subOrders.reduce(
    (result, subOrder) => {
      const { revenue, totalOrders, totalCustomers } = result;
      const { revenue: subOrderRevenue, companyName } = subOrder;

      return {
        revenue: revenue + subOrderRevenue,
        totalOrders: totalOrders + 1,
        totalCustomers: uniq([...totalCustomers, companyName]),
      };
    },
    {
      revenue: 0,
      totalOrders: 0,
      totalCustomers: [],
    },
  );

  return overviewInformation;
};

export const splitSubOrders = (
  subOrders: TObject[],
  restaurantListingId: string,
  currentOrderVATPercentage: number,
  startDate: number,
  endDate: number,
) => {
  const splittedSubOrders = subOrders.reduce((result: TObject[], order) => {
    const orderListing = Listing(order as TListing);
    const { plan, quotation } = order;
    const planListing = Listing(plan as TListing);
    const { orderDetail = {} } = planListing.getMetadata();
    const {
      serviceFees = {},
      vatSettings = {},
      companyName,
      deliveryHour,
      orderType = EOrderType.group,
    } = orderListing.getMetadata();
    const isGroupOrder = orderType === EOrderType.group;
    const { title: orderTitle } = orderListing.getAttributes();
    const orderId = orderListing.getId();

    const bulkSubOrders = Object.keys(orderDetail).reduce(
      (partnerSubOrders: any, subOrderDate) => {
        const { restaurant = {}, lastTransition } = orderDetail[subOrderDate];
        const { id: restaurantId } = restaurant;
        if (restaurantId !== restaurantListingId) {
          return partnerSubOrders;
        }
        const dayIndex = new Date(Number(subOrderDate)).getDay();
        const subOrderTitle = `${orderTitle}-${dayIndex > 0 ? dayIndex : 7}`;

        const vatSettingFromOrder = vatSettings[restaurantListingId];
        const partnerVATSetting =
          vatSettingFromOrder in EPartnerVATSetting
            ? vatSettingFromOrder
            : EPartnerVATSetting.vat;
        const vatPercentage = vatPercentageBaseOnVatSetting({
          vatSetting: partnerVATSetting,
          vatPercentage: currentOrderVATPercentage,
        });
        const partnerQuotation = calculatePriceQuotationPartner({
          quotation: quotation[restaurantListingId]?.quotation,
          serviceFeePercentage: serviceFees[restaurantListingId],
          currentOrderVATPercentage: vatPercentage,
          shouldSkipVAT: partnerVATSetting === EPartnerVATSetting.direct,
        });

        const { totalDishes } = calculateTotalPriceAndDishes({
          orderDetail,
          isGroupOrder,
          date: subOrderDate,
        });

        return [
          ...partnerSubOrders,
          {
            subOrderTitle,
            companyName,
            subOrderDate,
            deliveryHour,
            lastTransition,
            revenue: partnerQuotation.totalPrice,
            totalDishes,
            subOrderId: `${orderId}_${subOrderDate}`,
          },
        ];
      },
      [],
    );

    return [...result, ...bulkSubOrders];
  }, []);

  return splittedSubOrders.filter(
    (subOrder) =>
      subOrder.subOrderDate >= startDate && subOrder.subOrderDate <= endDate,
  );
};

const generateTimeRange = ({
  timeFrame,
  startDate,
  endDate,
}: {
  timeFrame: ETimeFrame;
  startDate: Date;
  endDate: Date;
}) => {
  const timestampRange = getTimePeriodBetweenDates(
    startDate,
    endDate,
    timeFrame,
  );
  switch (timeFrame) {
    case ETimeFrame.DAY: {
      return timestampRange.map(({ start, end }) => ({
        timeLabel: formatTimestamp(start.getTime(), 'dd'),
        timeRange: [start.getTime(), end.getTime()],
      }));
    }

    case ETimeFrame.WEEK: {
      return timestampRange.map(({ start, end }) => {
        return {
          timeLabel: `${formatTimestamp(
            start.getTime(),
            'dd/MM',
          )} - ${formatTimestamp(end.getTime(), 'dd/MM')}`,
          timeRange: [start.getTime(), end.getTime()],
        };
      });
    }

    case ETimeFrame.MONTH: {
      return timestampRange.map(({ start, end }) => {
        return {
          timeLabel: `${formatTimestamp(start.getTime(), 'MM/yy')}`,
          timeRange: [start.getTime(), end.getTime()],
        };
      });
    }

    default:
      return [];
  }
};

const groupDataByTimeFrame = (
  subOrders: TObject[],
  timePoint: {
    timeLabel: string;
    timeRange: number[];
  },
): TChartPoint => {
  const { timeLabel, timeRange } = timePoint;

  return subOrders.reduce(
    (result: any, subOrder) => {
      const { subOrderDate } = subOrder;
      if (subOrderDate >= timeRange[0] && subOrderDate <= timeRange[1]) {
        return {
          ...result,
          revenue: result.revenue + subOrder.revenue,
          orders: result.orders + 1,
        };
      }

      return result;
    },
    {
      dateLabel: timeLabel,
      revenue: 0,
      orders: 0,
    },
  );
};

export const formatChartData = ({
  subOrders,
  timeFrame,
  startDate,
  endDate,
}: {
  subOrders: TObject[];
  timeFrame: ETimeFrame;
  startDate: Date;
  endDate: Date;
}) => {
  const timeRange = generateTimeRange({
    timeFrame,
    startDate,
    endDate,
  });

  return timeRange.map((timePoint) =>
    groupDataByTimeFrame(subOrders, timePoint),
  );
};

export const getDisabledTimeFrameOptions = (
  timePeriodOption: ETimePeriodOption,
) => {
  if (
    timePeriodOption === ETimePeriodOption.LAST_WEEK ||
    timePeriodOption === ETimePeriodOption.LAST_7_DAYS
  ) {
    return [ETimeFrame.MONTH];
  }

  if (
    timePeriodOption === ETimePeriodOption.TODAY ||
    timePeriodOption === ETimePeriodOption.YESTERDAY
  ) {
    return [ETimeFrame.MONTH, ETimeFrame.WEEK];
  }

  return [];
};
