import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { Listing } from '@src/utils/data';
import { formatTimestamp, weekDayFormatFromDateTime } from '@src/utils/dates';
import type { TListing } from '@src/utils/types';

type TFoodData = {
  foodId: string;
  foodName: string;
  foodUnit: string;
};

type TOrderDetailEntry = {
  restaurant?: {
    foodList?: Record<
      string,
      {
        foodName?: string;
        foodUnit?: string;
      }
    >;
    restaurantName?: string;
  };
};

type TFoodByDate = {
  date: string;
  index: number;
  restaurantName: string;
  foodDataList: TFoodData[];
};

const OrderMenuPage = () => {
  const router = useRouter();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { orderId } = router.query;

  const { order, plans, loadDataInProgress } = useAppSelector(
    (state) => state.ParticipantOrderManagementPage,
    shallowEqual,
  );

  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (orderId) {
      dispatch(participantOrderManagementThunks.loadData(orderId as string));
    }
  }, [dispatch, orderId]);

  const orderListing = Listing(order as TListing);
  const { orderName } = orderListing.getPublicData();
  const title = orderListing.getAttributes().title;

  const orderDetail = useMemo(() => {
    if (!plans || plans.length === 0)
      return {} as Record<string, TOrderDetailEntry>;
    const plan = Listing(plans[0]);
    const { orderDetail: planOrderDetail = {} } = plan.getMetadata();

    return planOrderDetail as Record<string, TOrderDetailEntry>;
  }, [plans]);

  const foodOrderGroupedByDate: TFoodByDate[] = useMemo(() => {
    if (!orderDetail || Object.keys(orderDetail).length === 0) return [];

    return Object.entries(orderDetail)
      .map(([date, dateData], index) => {
        const { restaurant = {} } = (dateData as TOrderDetailEntry) || {};
        const { foodList = {}, restaurantName = '' } = restaurant || {};

        const foodDataList: TFoodData[] = Object.entries(foodList).map(
          ([foodId, foodData]) => ({
            foodId,
            foodName: foodData?.foodName || '',
            foodUnit: foodData?.foodUnit || '',
          }),
        );

        return {
          date,
          index,
          restaurantName,
          foodDataList,
        };
      })
      .filter((item) => item.foodDataList.length > 0)
      .sort((a, b) => Number(a.date) - Number(b.date));
  }, [orderDetail]);

  const currentYear = new Date().getFullYear();

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  if (loadDataInProgress) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingContainer />
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {intl.formatMessage(
                { id: 'OrderMenuPage.title' },
                { orderName, title },
              )}
            </h1>
            <p className="text-gray-600">
              {intl.formatMessage({ id: 'OrderMenuPage.subtitle' })}
            </p>
          </div>

          {/* Menu Table */}
          {foodOrderGroupedByDate.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">
                {intl.formatMessage({ id: 'OrderMenuPage.emptyMessage' })}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-700">
                  <div>
                    {intl.formatMessage({
                      id: 'ReviewOrderDetailsSection.tableHead.no',
                    })}
                  </div>
                  <div className="col-span-8">
                    {intl.formatMessage({
                      id: 'ReviewOrderDetailsSection.tableHead.foodType',
                    })}
                  </div>
                  <div>
                    {intl.formatMessage({
                      id: 'ReviewOrderDetailsSection.tableHead.unit',
                    })}
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {foodOrderGroupedByDate.map((dateData) => {
                  const {
                    date,
                    foodDataList = [],
                    restaurantName = '',
                    index,
                  } = dateData;

                  const isCurrentYear =
                    new Date(Number(date)).getFullYear() === currentYear;
                  const formattedWeekDay = weekDayFormatFromDateTime(
                    DateTime.fromMillis(Number(date)),
                  );
                  const formattedDate = `${formattedWeekDay}, ${formatTimestamp(
                    Number(date),
                    isCurrentYear ? 'dd/MM' : 'dd/MM/yyyy',
                  )}`;

                  const isCollapsed = collapsedDates[date] ?? false;

                  return (
                    <div key={date} className="bg-white">
                      {/* Date Header Row */}
                      <div
                        className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => toggleDateCollapse(date)}>
                        <div className="font-semibold text-gray-900">
                          {index + 1}
                        </div>
                        <div className="col-span-8">
                          <div className="font-semibold text-gray-900">
                            {formattedDate}
                          </div>
                          {restaurantName && (
                            <div className="text-sm text-gray-600 mt-1">
                              {restaurantName}
                            </div>
                          )}
                        </div>
                        <div className="col-span-3 flex items-center justify-end">
                          <IconArrow
                            direction={isCollapsed ? 'down' : 'up'}
                            className="text-gray-500"
                          />
                        </div>
                      </div>

                      {/* Food Items Rows */}
                      {!isCollapsed && (
                        <div className="divide-y divide-gray-100">
                          {foodDataList.map((foodData, foodIndex: number) => {
                            const {
                              foodId,
                              foodUnit = '',
                              foodName = '',
                            } = foodData;

                            return (
                              <div
                                key={foodId || foodIndex}
                                className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                                <div className="col-span-1 text-gray-600">
                                  {index + 1}.{foodIndex + 1}
                                </div>
                                <div className="col-span-8 text-gray-900">
                                  {foodName}
                                </div>
                                <div className="col-span-3 text-gray-600">
                                  {foodUnit}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default OrderMenuPage;
