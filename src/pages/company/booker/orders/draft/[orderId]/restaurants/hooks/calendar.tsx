import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import Toolbar from '../../components/Toolbar/Toolbar';

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
  const { orderId } = router.query;

  const fetchOrderInProgress = useAppSelector(
    (state) => state.Order.fetchOrderInProgress,
  );

  const fetchOrderDetailInProgress = useAppSelector(
    (state) => state.Order.fetchOrderDetailInProgress,
  );

  const updatePlanDetailInprogress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );

  const orderData = Listing(order as TListing);
  const planId = orderData.getMetadata().plans?.[0];

  const handleEditFood = useCallback(
    (date: string, restaurantId: string, menuId: string) => {
      router.push(
        `/company/booker/orders/draft/${orderId}/restaurants?timestamp=${date}&restaurantId=${restaurantId}&menuId=${menuId}`,
      );
    },
    [orderId, router],
  );

  const calendarExtraResources = useMemo(() => {
    return {
      planId,
      startDate,
      endDate,
      updatePlanDetailInprogress,
      fetchPlanDetailInProgress:
        fetchOrderDetailInProgress || fetchOrderInProgress,
      onEditFood: handleEditFood,
    };
  }, [
    planId,
    endDate,
    fetchOrderDetailInProgress,
    fetchOrderInProgress,
    startDate,
    updatePlanDetailInprogress,
    handleEditFood,
  ]);

  return calendarExtraResources;
};

export const useGetCalendarComponentProps = ({
  startDate,
  endDate,
  isFinishOrderDisabled,
  handleFinishOrder,
}: {
  startDate: Date;
  endDate: Date;
  isFinishOrderDisabled: boolean;
  handleFinishOrder: () => Promise<void>;
}) => {
  const router = useRouter();
  const bookerPublishOrderInProgress = useAppSelector(
    (state) => state.Order.bookerPublishOrderInProgress,
  );

  const { orderId } = router.query;

  const handleAddMeal = useCallback(
    () => (date: Date) => {
      router.push(
        `/company/booker/orders/draft/${orderId}/restaurants?timestamp=${date.getTime()}`,
      );
    },
    [orderId, router],
  );

  const toolbarComponent = useCallback(
    (props: any) => (
      <Toolbar
        {...props}
        startDate={startDate.getTime()}
        endDate={endDate.getTime()}
        finishDisabled={isFinishOrderDisabled}
        finishInProgress={bookerPublishOrderInProgress}
        onFinishOrder={handleFinishOrder}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startDate, endDate, isFinishOrderDisabled, bookerPublishOrderInProgress],
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
      contentEnd: contentEndComponent,
    };
  }, [toolbarComponent, contentEndComponent]);

  return componentsProps;
};
