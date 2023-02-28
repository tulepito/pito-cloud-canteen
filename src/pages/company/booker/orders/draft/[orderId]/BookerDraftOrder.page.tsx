/* eslint-disable @typescript-eslint/no-shadow */
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { useAppDispatch } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { companyPaths } from '@src/paths';
import { Listing } from '@utils/data';
import { EBookerOrderDraftStates, EOrderDraftStates } from '@utils/enums';
import type { TListing } from '@utils/types';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import Layout from '../../components/Layout/Layout';
import LayoutMain from '../../components/Layout/LayoutMain';
import LayoutSidebar from '../../components/Layout/LayoutSidebar';
import css from './BookerDraftOrder.module.scss';
import SidebarContent from './components/SidebarContent/SidebarContent';
import { useLoadData, useLoadPlanDetails } from './hooks/loadData';
import {
  useGetCalendarComponentProps,
  useGetCalendarExtraResources,
} from './restaurants/hooks/calendar';
import { useGetBoundaryDates } from './restaurants/hooks/dateTime';

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
  const { orderState } = Listing(order as TListing).getMetadata();
  const { orderDetail = [] } = useLoadPlanDetails();
  const { startDate, endDate } = useGetBoundaryDates(order);
  const calendarExtraResources = useGetCalendarExtraResources({
    order,
    startDate,
    endDate,
  });

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
  });

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
