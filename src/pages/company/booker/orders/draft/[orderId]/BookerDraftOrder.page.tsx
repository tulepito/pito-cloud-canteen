/* eslint-disable @typescript-eslint/no-shadow */
import { useCallback, useEffect, useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import {
  findSuitableStartDate,
  isEnableSubmitPublishOrder,
} from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { companyPaths } from '@src/paths';
import { Listing } from '@utils/data';
import { EBookerOrderDraftStates, EOrderDraftStates } from '@utils/enums';
import type { TListing } from '@utils/types';

import Layout from '../../components/Layout/Layout';
import LayoutMain from '../../components/Layout/LayoutMain';
import LayoutSidebar from '../../components/Layout/LayoutSidebar';

import SidebarContent from './components/SidebarContent/SidebarContent';
import { useGetPlanDetails, useLoadData } from './hooks/loadData';
import {
  useGetCalendarComponentProps,
  useGetCalendarExtraResources,
} from './restaurants/hooks/calendar';
import { useGetBoundaryDates } from './restaurants/hooks/dateTime';

import css from './BookerDraftOrder.module.scss';

const EnableToAccessPageOrderStates = [
  EOrderDraftStates.pendingApproval,
  EBookerOrderDraftStates.bookerDraft,
];

function BookerDraftOrderPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [collapse, setCollapse] = useState(false);

  const dispatch = useAppDispatch();

  const { order, companyAccount } = useLoadData({
    orderId: orderId as string,
  });
  const {
    orderState,
    plans = [],
    startDate: startDateTimestamp,
    endDate: endDateTimestamp,
  } = Listing(order as TListing).getMetadata();
  const planId = plans.length > 0 ? plans[0] : undefined;

  const selectedDate = useAppSelector(
    (state) => state.Order.selectedCalendarDate,
  );
  const { orderDetail = [] } = useGetPlanDetails();
  const { startDate, endDate } = useGetBoundaryDates(order);
  const calendarExtraResources = useGetCalendarExtraResources({
    order,
    startDate,
    endDate,
  });

  const isFinishOrderDisabled = !isEnableSubmitPublishOrder(
    order as TListing,
    orderDetail,
  );

  const suitableStartDate = useMemo(() => {
    const temp = findSuitableStartDate({
      selectedDate,
      startDate: startDateTimestamp,
      endDate: endDateTimestamp,
      orderDetail,
    });

    return temp instanceof Date ? temp : new Date(temp);
  }, [selectedDate, startDateTimestamp, endDateTimestamp, orderDetail]);

  const handleFinishOrder = async () => {
    const { meta } = await dispatch(
      orderAsyncActions.bookerPublishOrder({ orderId, planId }),
    );

    if (meta.requestStatus !== 'rejected') {
      router.push({
        pathname: companyPaths.ManageOrderPicking,
        query: { orderId: orderId as string },
      });
    }
  };

  const handleCollapse = useCallback(() => {
    setCollapse(!collapse);
  }, [collapse]);

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

  const componentsProps = useGetCalendarComponentProps({
    startDate,
    endDate,
    isFinishOrderDisabled,
    handleFinishOrder,
  });

  useEffect(() => {
    if (!isEmpty(orderState)) {
      if (orderState === EOrderDraftStates.draft) {
        router.push({ pathname: companyPaths.CreateNewOrder });
      } else if (!EnableToAccessPageOrderStates.includes(orderState)) {
        router.push({
          pathname: companyPaths.ManageOrderPicking,
          query: { orderId: orderId as string },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, orderState]);

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
            anchorDate={suitableStartDate}
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
