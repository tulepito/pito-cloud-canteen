/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  orderAsyncActions,
  setOnRecommendRestaurantInProcess,
} from '@redux/slices/Order.slice';
import { convertWeekDay, renderDateRange } from '@src/utils/dates';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

import { BookerDraftOrderPageActions } from '../../BookerDraftOrderPage.slice';
import Toolbar from '../../components/Toolbar/Toolbar';
import { BookerSelectRestaurantActions } from '../BookerSelectRestaurant.slice';

export const useGetCalendarExtraResources = ({
  order,
  startDate,
  endDate,
}: {
  order: TListing | null;
  startDate: Date;
  endDate: Date;
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orderId } = router.query;

  const fetchOrderInProgress = useAppSelector(
    (state) => state.Order.fetchOrderInProgress,
  );
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const fetchOrderDetailInProgress = useAppSelector(
    (state) => state.Order.fetchOrderDetailInProgress,
  );
  const planDetail = useAppSelector(
    (state) => state.BookerSelectRestaurant.planDetail,
  );
  const updatePlanDetailInprogress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );
  const selectedDate = useAppSelector(
    (state) => state.BookerDraftOrderPage.selectedCalendarDate,
  );
  const onRescommendRestaurantForSpecificDateInProgress = useAppSelector(
    (state) => state.Order.onRescommendRestaurantForSpecificDateInProgress,
  );
  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );

  const orderData = Listing(order as TListing);
  const planId = orderData.getMetadata().plans?.[0];
  const { dayInWeek = [] } = orderData.getMetadata();
  const onApplyOtherDaysInProgress = updateOrderDetailInProgress;

  const onSearchRestaurant = useCallback(
    (date: Date) => {
      router.push(
        `/company/booker/orders/draft/${orderId}/restaurants?timestamp=${date.getTime()}`,
      );
    },
    [orderId, router],
  );

  const onApplyOtherDays = useCallback(
    async (date: string, selectedDates: string[]) => {
      const totalDates = renderDateRange(
        startDate.getTime(),
        endDate.getTime(),
      );
      const newOrderDetail = totalDates.reduce((result, curr) => {
        if (
          selectedDates.includes(
            convertWeekDay(DateTime.fromMillis(curr).weekday).key,
          )
        ) {
          return {
            ...result,
            [curr]: { ...orderDetail?.[date] },
          };
        }

        return result;
      }, orderDetail);
      await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId,
          orderDetail: newOrderDetail,
        }),
      );
    },
    [startDate, endDate, orderDetail, dispatch, orderId, planId],
  );

  const onRecommendRestaurantForSpecificDay = useCallback(
    async (date: number) => {
      dispatch(
        BookerDraftOrderPageActions.selectCalendarDate(
          DateTime.fromMillis(date).toJSDate(),
        ),
      );
      const { payload } = await dispatch(
        orderAsyncActions.recommendRestaurantForSpecificDay({ dateTime: date }),
      );
      const newPlanDetail = {
        ...planDetail,
        attributes: {
          ...planDetail?.attributes,
          metadata: {
            ...planDetail?.attributes.metadata,
            orderDetail: (payload as TObject).orderDetail,
          },
        },
      };
      dispatch(BookerSelectRestaurantActions.setPlanDetail(newPlanDetail));
    },
    [dispatch, JSON.stringify(planDetail)],
  );

  const onRecommendRestaurantForSpecificDayInProgress = useCallback(
    (timestamp: number) => {
      return (
        onRescommendRestaurantForSpecificDateInProgress &&
        selectedDate?.getTime() === timestamp
      );
    },
    [onRescommendRestaurantForSpecificDateInProgress, selectedDate],
  );

  const calendarExtraResources = useMemo(() => {
    return {
      planId,
      startDate,
      endDate,
      updatePlanDetailInprogress,
      fetchPlanDetailInProgress:
        fetchOrderDetailInProgress || fetchOrderInProgress,
      onSearchRestaurant,
      dayInWeek,
      onApplyOtherDays,
      onRecommendRestaurantForSpecificDay,
      onRecommendRestaurantForSpecificDayInProgress,
      onApplyOtherDaysInProgress,
    };
  }, [
    planId,
    endDate,
    fetchOrderDetailInProgress,
    fetchOrderInProgress,
    startDate,
    updatePlanDetailInprogress,
    onSearchRestaurant,
    dayInWeek,
    onApplyOtherDays,
    onRecommendRestaurantForSpecificDay,
    onRecommendRestaurantForSpecificDayInProgress,
    onApplyOtherDaysInProgress,
  ]);

  return calendarExtraResources;
};

export const useGetCalendarComponentProps = ({
  startDate,
  endDate,
  isFinishOrderDisabled,
  handleFinishOrder,
  order,
  shouldHideDayItems = false,
  shouldHideExtraActionBtn = false,
}: {
  startDate: Date;
  endDate: Date;
  isFinishOrderDisabled: boolean;
  handleFinishOrder: () => Promise<void>;
  order: TListing | null;
  shouldHideDayItems: boolean;
  shouldHideExtraActionBtn?: boolean;
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const publishOrderInProgress = useAppSelector(
    (state) => state.Order.publishOrderInProgress,
  );
  const onRecommendRestaurantInProgress = useAppSelector(
    (state) => state.Order.onRecommendRestaurantInProgress,
  );

  const { orderId } = router.query;
  const { plans = [] } = Listing(order).getMetadata();
  const handleAddMeal = useCallback(
    () => (date: Date) => {
      router.push(
        `/company/booker/orders/draft/${orderId}/restaurants?timestamp=${date.getTime()}`,
      );
    },
    [orderId, router],
  );

  const onRecommendNewRestaurants = useCallback(async () => {
    if (!onRecommendRestaurantInProgress) {
      dispatch(setOnRecommendRestaurantInProcess(true));
      const { payload: recommendOrderDetail }: any = await dispatch(
        orderAsyncActions.recommendRestaurants({}),
      );
      await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId: plans[0],
          orderDetail: recommendOrderDetail,
        }),
      );
      dispatch(setOnRecommendRestaurantInProcess(false));
    }
  }, [dispatch, onRecommendRestaurantInProgress, orderId, plans]);

  const toolbarComponent = useCallback(
    (props: any) => (
      <Toolbar
        {...props}
        startDate={startDate.getTime()}
        endDate={endDate.getTime()}
        finishDisabled={isFinishOrderDisabled}
        finishInProgress={publishOrderInProgress}
        onFinishOrder={handleFinishOrder}
        onRecommendRestaurantInProgress={onRecommendRestaurantInProgress}
        onRecommendNewRestaurants={onRecommendNewRestaurants}
        shouldHideExtraActionBtn={shouldHideExtraActionBtn}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      startDate,
      endDate,
      isFinishOrderDisabled,
      publishOrderInProgress,
      onRecommendRestaurantInProgress,
    ],
  );

  const contentEndComponent = useCallback(
    (props: any) => (
      <AddMorePlan
        {...props}
        onClick={handleAddMeal()}
        startDate={props?.resources?.startDate?.getTime()}
        endDate={props?.resources?.endDate?.getTime()}
        loading={props?.resources?.fetchPlanDetailInProgress}
      />
    ),
    [handleAddMeal],
  );

  const componentsProps = useMemo(() => {
    return {
      toolbar: toolbarComponent,
      contentEnd: shouldHideDayItems ? () => null : contentEndComponent,
    };
  }, [shouldHideDayItems, toolbarComponent, contentEndComponent]);

  return componentsProps;
};
