import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { ParticipantOrderAsyncAction } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import OrderCalendarView from '../../components/OrderCalendarView/OrderCalendarView';
import OrderListView from '../../components/OrderListView/OrderListView';
import SectionOrderHeader from '../../components/SectionOrderHeader/SectionOrderHeader';
import { VIEWS } from '../../helpers/constants';

const ParticipantOrderManagement = () => {
  const router = useRouter();
  const { isReady, query } = router;
  const { orderId } = query;

  // State
  const [currentView, setCurrentView] = useState(VIEWS.CALENDAR);
  const currentUser = useAppSelector((state) => state.user.currentUser);

  // Hooks
  const { order, company, plans, subOrders, loadDataInProgress } =
    useAppSelector((state) => state.ParticipantOrderManagementPage);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isReady) {
      dispatch(ParticipantOrderAsyncAction.loadData(orderId as string));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <ParticipantLayout>
      <SectionOrderHeader
        currentView={currentView}
        setViewFunction={setCurrentView}
      />
      {currentView === VIEWS.CALENDAR ? (
        <OrderCalendarView
          company={company}
          order={order}
          plans={plans}
          subOrders={subOrders}
          currentUser={currentUser}
          loadDataInProgress={loadDataInProgress}
        />
      ) : (
        <OrderListView />
      )}
    </ParticipantLayout>
  );
};

export default ParticipantOrderManagement;
