import React, { useEffect, useState } from 'react';
// import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { User } from '@src/utils/data';
import type { TUser } from '@utils/types';

import OrderCalendarView from '../../components/OrderCalendarView/OrderCalendarView';
import SectionOrderHeader from '../../components/SectionOrderHeader/SectionOrderHeader';
import { VIEWS } from '../../helpers/constants';

import css from './ParticipantOrderManagement.module.scss';

const ParticipantOrderManagement = () => {
  const router = useRouter();
  // const intl = useIntl();
  const dispatch = useAppDispatch();

  const { isReady, query } = router;
  const { orderId } = query;
  const isOwnerControl = useBoolean();
  // State
  const [currentView, setCurrentView] = useState(VIEWS.CALENDAR);
  const currentUser = useAppSelector(currentUserSelector);
  const company = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.company,
    shallowEqual,
  );
  const order = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.order,
    shallowEqual,
  );
  const plans = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.plans,
    shallowEqual,
  );
  const subOrders = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.subOrders,
    shallowEqual,
  );
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.loadDataInProgress,
  );

  useEffect(() => {
    if (isReady) {
      dispatch(participantOrderManagementThunks.loadData(orderId as string));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // const onTabChange = (tabItem: any) => {
  //   if (tabItem.id === 'personal') {
  //     isOwnerControl.setTrue();
  //   } else {
  //     isOwnerControl.setFalse();
  //   }
  // };

  const tabOptions = [
    // {
    //   id: 'personal',
    //   label: (
    //     <div className={css.companyTab}>
    //       <div className={css.fakeAvatar}></div>
    //       <span>
    //         {intl.formatMessage({
    //           id: 'ParticipantOrderManagement.tab.personal',
    //         })}
    //       </span>
    //     </div>
    //   ),
    //   childrenFn: () => <div></div>,
    // },
    {
      id: 'company',
      label: (
        <div className={css.companyTab}>
          <Avatar
            className={css.companyAvatar}
            user={company as TUser}
            disableProfileLink
          />
          <span>{User(company as TUser).getPublicData()?.companyName}</span>
        </div>
      ),
      childrenFn: (props: any) => <OrderCalendarView {...props} />,
      childrenProps: {
        company,
        order,
        plans,
        subOrders,
        currentUser,
        loadDataInProgress,
      },
    },
  ];

  return (
    <ParticipantLayout>
      <SectionOrderHeader
        currentView={currentView}
        setViewFunction={setCurrentView}
        showToggle={isOwnerControl.value}
      />
      {loadDataInProgress ? (
        <>
          <CalendarDashboard
            inProgress={loadDataInProgress}
            components={{ toolbar: () => <></> }}
          />
        </>
      ) : (
        <Tabs items={tabOptions as any} />
      )}
    </ParticipantLayout>
  );
};

export default ParticipantOrderManagement;
