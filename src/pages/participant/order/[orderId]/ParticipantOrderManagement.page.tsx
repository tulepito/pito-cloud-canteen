import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import type { TListing, TUser } from '@utils/types';

import OrderCalendarView from '../../components/OrderCalendarView/OrderCalendarView';
import SectionOrderHeader from '../../components/SectionOrderHeader/SectionOrderHeader';
import { VIEWS } from '../../helpers/constants';

const ParticipantOrderManagement = () => {
  const router = useRouter();
  const { isReady, query } = router;
  const { orderId } = query;

  // State
  const [currentView, setCurrentView] = useState(VIEWS.CALENDAR);
  const currentUser = useAppSelector(currentUserSelector);

  // Hooks
  const { order, company, plans, subOrders, loadDataInProgress } =
    useAppSelector((state) => state.ParticipantOrderManagementPage);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isReady) {
      dispatch(participantOrderManagementThunks.loadData(orderId as string));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <ParticipantLayout>
      <SectionOrderHeader
        currentView={currentView}
        setViewFunction={setCurrentView}
      />
      <OrderCalendarView
        company={company as TUser}
        order={order as TListing}
        plans={plans}
        subOrders={subOrders}
        currentUser={currentUser}
        loadDataInProgress={loadDataInProgress}
      />
    </ParticipantLayout>
  );
};

export default ParticipantOrderManagement;
