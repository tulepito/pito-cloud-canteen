import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { useAppDispatch } from '@hooks/reduxHooks';
import { OrderAsyncAction } from '@redux/slices/Order.slice';
import { LISTING } from '@utils/data';
import type { TListing } from '@utils/types';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Layout from '../components/Layout/Layout';
import LayoutMain from '../components/Layout/LayoutMain';
import LayoutSidebar from '../components/Layout/LayoutSidebar';
import css from './BookerDraftOrder.module.scss';
import SidebarContent from './components/SidebarContent/SidebarContent';
import Toolbar from './components/Toolbar/Toolbar';
import { useLoadData, useLoadPlanDetails } from './hooks/loadData';

function BookerDraftOrderPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [collapse, setCollapse] = useState(false);
  const dispatch = useAppDispatch();

  const handleCollapse = () => {
    setCollapse(!collapse);
  };

  const { order } = useLoadData({
    orderId: orderId as string,
  });
  const orderData = LISTING(order as TListing);
  const {
    startDate: startTimestamp,
    endDate: endTimestamp,
    plans,
  } = orderData.getMetadata();
  console.log('orderData', plans?.[0]);
  const nextStartWeek = DateTime.fromJSDate(new Date())
    .startOf('week')
    .startOf('day')
    .plus({ days: 7 })
    .toJSDate();
  const nextEndWeek = DateTime.fromJSDate(new Date())
    .endOf('week')
    .endOf('day')
    .plus({ days: 7 })
    .toJSDate();

  const startDate = startTimestamp
    ? DateTime.fromMillis(Number(startTimestamp)).startOf('day').toJSDate()
    : nextStartWeek;
  const endDate = endTimestamp
    ? DateTime.fromMillis(Number(endTimestamp)).endOf('day').toJSDate()
    : nextEndWeek;

  const { orderDetail = [] } = useLoadPlanDetails();

  const handleAddMeal = (date: Date) => () => {
    console.log('plans[0]zz', plans?.[0]);
    dispatch(
      OrderAsyncAction.updatePlanDetail({
        orderId,
        planId: plans[0],
        updateMode: 'merge',
        orderDetail: {
          [date.getTime()]: {
            restaurant: {
              id: '63d776c9-9bc4-4d57-853f-1e9062417220',
              restaurantName: 'trang',
            },
            foodList: {
              '63e0b73b-60a1-49a3-92af-a9c741db911c': {
                foodPrice: 10000,
                foodName: 'Rau muống xào tỏi kèm vị đắng của cafe Copy',
              },
            },
          },
        },
      }),
    );
  };

  const handleRemoveMeal = (resourceId: string) => {
    dispatch(
      OrderAsyncAction.updatePlanDetail({
        orderId,
        planId: plans[0],
        orderDetail: {
          [resourceId]: null,
        },
        updateMode: 'merge',
      }),
    );
  };

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
              <MealPlanCard {...props} onRemove={handleRemoveMeal} />
            )}
            companyLogo="Company"
            hideMonthView
            components={{
              contentEnd: (props) => (
                <AddMorePlan
                  {...props}
                  onClick={handleAddMeal}
                  startDate={startDate}
                  endDate={endDate}
                />
              ),
              toolbar: (props) => <Toolbar {...props} />,
            }}
          />
        </div>
      </LayoutMain>
    </Layout>
  );
}

export default BookerDraftOrderPage;
