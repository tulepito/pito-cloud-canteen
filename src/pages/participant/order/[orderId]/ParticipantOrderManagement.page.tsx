import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { ParticipantOrderAsyncAction } from '@redux/slices/ParticipantOrderManagementPage';
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

  // Hooks
  const { order, company, restaurant } = useAppSelector(
    (state) => state.ParticipantOrderManagementPage,
  );

  const dispatch = useAppDispatch();

  const fetchData = async () => {
    await dispatch(ParticipantOrderAsyncAction.loadData(orderId as string));
  };
  useEffect(() => {
    if (isReady) {
      fetchData();
    }
  }, [isReady]);

  return (
    <ParticipantLayout>
      <SectionOrderHeader
        currentView={currentView}
        setViewFunction={setCurrentView}
      />
      {currentView === VIEWS.CALENDAR ? (
        <OrderCalendarView company={company} />
      ) : (
        <OrderListView />
      )}
    </ParticipantLayout>
  );
};

export default ParticipantOrderManagement;
