/* eslint-disable @typescript-eslint/no-shadow */
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { companyPaths } from '@src/paths';
import { Listing } from '@utils/data';
import { EBookerOrderDraftStates, EOrderDraftStates } from '@utils/enums';
import type { TListing } from '@utils/types';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import Layout from '../../components/Layout/Layout';
import LayoutMain from '../../components/Layout/LayoutMain';
import LayoutSidebar from '../../components/Layout/LayoutSidebar';
import css from './BookerDraftOrder.module.scss';
import SidebarContent from './components/SidebarContent/SidebarContent';
import Toolbar from './components/Toolbar/Toolbar';
import { useLoadData, useLoadPlanDetails } from './hooks/loadData';

const EnableToAccessPageOrderStates = [
  EOrderDraftStates.pendingApproval,
  EBookerOrderDraftStates.bookerDraft,
];

function BookerDraftOrderPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [collapse, setCollapse] = useState(false);

  const updatePlanDetailInprogress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );
  const bookerPublishOrderInProgress = useAppSelector(
    (state) => state.Order.bookerPublishOrderInProgress,
  );
  const { order, fetchOrderInProgress } = useLoadData({
    orderId: orderId as string,
  });

  const { orderDetail = [], fetchOrderDetailInProgress } = useLoadPlanDetails();

  const orderData = Listing(order as TListing);
  const {
    startDate: startTimestamp,
    endDate: endTimestamp,
    plans = [],
    orderState,
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
  const isDoneSetupPlan =
    !isEmpty(orderDetail) &&
    orderDetail.every(({ resource: { isSelected } }) => isSelected);

  const calendarExtraResources = useMemo(() => {
    return {
      orderId,
      planId,
      startDate,
      endDate,
      updatePlanDetailInprogress,
      fetchPlanDetailInProgress:
        fetchOrderDetailInProgress || fetchOrderInProgress,
    };
  }, [
    orderId,
    planId,
    endDate,
    fetchOrderDetailInProgress,
    fetchOrderInProgress,
    startDate,
    updatePlanDetailInprogress,
  ]);

  const dispatch = useAppDispatch();

  const handleCollapse = () => {
    setCollapse(!collapse);
  };

  const handleAddMeal = () => (date: Date) => {
    router.push(
      `/company/booker/orders/draft/${orderId}/restaurants?timestamp=${date.getTime()}`,
    );
  };

  const handleRemoveMeal = (id: string) => (resourceId: string) => {
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
  };

  const handleFinishOrder = async () => {
    await dispatch(orderAsyncActions.bookerPublishOrder({ orderId, planId }));
    setTimeout(() => {
      router.push({
        pathname: '/orders/[orderId]',
        query: { orderId: orderId as string },
      });
    }, 1000);
  };

  useEffect(() => {
    if (!isEmpty(orderState)) {
      if (orderState === EOrderDraftStates.draft) {
        router.push({ pathname: companyPaths.CreateNewOrder });
      } else if (!EnableToAccessPageOrderStates.includes(orderState)) {
        router.push({
          pathname: '/orders/[orderId]',
          query: { orderId: orderId as string },
        });
      }
    }
  }, [orderId, orderState]);

  return (
    <Layout className={css.root}>
      <LayoutSidebar
        logo={<span></span>}
        collapse={collapse}
        onCollapse={handleCollapse}>
        <SidebarContent order={order} />
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
            components={{
              contentEnd: (props: any) => (
                <AddMorePlan
                  {...props}
                  onClick={handleAddMeal()}
                  startDate={props?.resources?.startDate?.getTime()}
                  endDate={props?.resources?.endDate?.getTime()}
                  loading={props?.resources?.fetchPlanDetailInProgress}
                />
              ),
              toolbar: (props) => {
                const newProps = {
                  ...props,
                  startDate,
                  endDate,
                  finishDisabled: !isDoneSetupPlan,
                  finishInProgress: bookerPublishOrderInProgress,
                  onFinishOrder: handleFinishOrder,
                };

                return <Toolbar {...newProps} />;
              },
            }}
          />
        </div>
      </LayoutMain>
    </Layout>
  );
}

export default BookerDraftOrderPage;
