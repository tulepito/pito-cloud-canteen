import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

import Layout from '../../components/Layout/Layout';
import LayoutMain from '../../components/Layout/LayoutMain';
import LayoutSidebar from '../../components/Layout/LayoutSidebar';
import css from './BookerDraftOrder.module.scss';
import SidebarContent from './components/SidebarContent/SidebarContent';
import Toolbar from './components/Toolbar/Toolbar';
import { useLoadData, useLoadPlanDetails } from './hooks/loadData';

function BookerDraftOrderPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [collapse, setCollapse] = useState(false);

  const updatePlanDetailInprogress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );

  const { order, fetchOrderInProgress, companyAccount } = useLoadData({
    orderId: orderId as string,
  });

  const { orderDetail = [], fetchOrderDetailInProgress } = useLoadPlanDetails();

  const orderData = Listing(order as TListing);
  const {
    startDate: startTimestamp,
    endDate: endTimestamp,
    plans = [],
  } = orderData.getMetadata();
  const planId = plans?.[0];

  const startDate = useMemo(() => {
    const nextStartWeek = DateTime.fromJSDate(new Date())
      .startOf('week')
      .startOf('day')
      .plus({ days: 7 })
      .toJSDate();

    return startTimestamp
      ? DateTime.fromMillis(Number(startTimestamp)).startOf('day').toJSDate()
      : nextStartWeek;
  }, [startTimestamp]);

  const endDate = useMemo(() => {
    const nextEndWeek = DateTime.fromJSDate(new Date())
      .endOf('week')
      .endOf('day')
      .plus({ days: 7 })
      .toJSDate();

    return endTimestamp
      ? DateTime.fromMillis(Number(endTimestamp)).endOf('day').toJSDate()
      : nextEndWeek;
  }, [endTimestamp]);

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

  const dispatch = useAppDispatch();

  const handleCollapse = () => {
    setCollapse(!collapse);
  };

  const handleAddMeal = useCallback(
    () => (date: Date) => {
      router.push(
        `/company/booker/orders/draft/${orderId}/restaurants?timestamp=${date.getTime()}`,
      );
    },
    [orderId, router],
  );

  const handleRemoveMeal = useCallback(
    (id: string) => (resourceId: string) => {
      dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId: id,
          orderDetail: {
            [resourceId]: null,
          },
          updateMode: 'merge',
        }),
      );
    },
    [dispatch, orderId],
  );

  const toolbarComponent = useCallback(
    (props: any) => (
      <Toolbar
        {...props}
        startDate={startDate.getTime()}
        endDate={endDate.getTime()}
      />
    ),
    [startDate, endDate],
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

  return (
    <Layout className={css.root}>
      <LayoutSidebar
        logo={<span></span>}
        collapse={collapse}
        onCollapse={handleCollapse}>
        <SidebarContent order={order} companyAccount={companyAccount} />
      </LayoutSidebar>
      <LayoutMain>
        <div className={css.main}>
          <CalendarDashboard
            className={css.calendar}
            anchorDate={startDate}
            startDate={startDate}
            endDate={endDate}
            events={orderDetail}
            renderEvent={(props: any) => (
              <MealPlanCard
                {...props}
                removeInprogress={props?.resources?.updatePlanDetailInprogress}
                onRemove={handleRemoveMeal(props?.resources?.planId)}
              />
            )}
            companyLogo="Company"
            hideMonthView
            resources={calendarExtraResources}
            components={componentsProps}
          />
        </div>
      </LayoutMain>
    </Layout>
  );
}

export default BookerDraftOrderPage;
