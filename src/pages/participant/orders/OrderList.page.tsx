/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { CurrentUser } from '@src/utils/data';

import ParticipantToolbar from '../components/ParticipantToolbar/ParticipantToolbar';

import OnboardingOrderModal from './components/OnboardingOrderModal/OnboardingOrderModal';
import OnboardingTour from './components/OnboardingTour/OnboardingTour';
import OrderListHeaderSection from './components/OrderListHeaderSection/OrderListHeaderSection';
import UpdateProfileModal from './components/UpdateProfileModal/UpdateProfileModal';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import { OrderListThunks } from './OrderList.slice';

import css from './OrderList.module.scss';

const OrderListPage = () => {
  const dispatch = useAppDispatch();
  const welcomeModalControl = useBoolean();
  const updateProfileModalControl = useBoolean();
  const onBoardingModal = useBoolean();
  const tourControl = useBoolean();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = CurrentUser(currentUser!);
  const currentUserId = currentUserGetter.getId();
  const { walkthroughEnable = true } = currentUserGetter.getMetadata();
  // useEffect(() => {
  //   dispatch(OrderListThunks.fetchOrders(currentUserId));
  // }, [currentUserId]);

  useEffect(() => {
    dispatch(OrderListThunks.fetchAttributes());
  }, []);
  const openUpdateProfileModal = () => {
    updateProfileModalControl.setTrue();
  };
  const handleCloseWalkThrough = () => {
    tourControl.setFalse();
    onBoardingModal.setFalse();
    dispatch(OrderListThunks.disableWalkthrough(currentUserId));
  };

  return (
    <ParticipantLayout>
      <OrderListHeaderSection />
      <div className={css.calendarContainer}>
        <CalendarDashboard
          // anchorDate={anchorDate}
          events={[]}
          // companyLogo={sectionCompanyBranding}
          renderEvent={OrderEventCard}
          // inProgress={loadDataInProgress}
          // exposeAnchorDate={handleAnchorDateChange}
          components={{
            toolbar: (toolBarProps: any) => (
              <ParticipantToolbar
                {...toolBarProps}
                // startDate={new Date(startDate)}
                // endDate={new Date(endDate)}
                // anchorDate={anchorDate}
              />
            ),
          }}
        />
      </div>
      <WelcomeModal
        isOpen={welcomeModalControl.value}
        onClose={welcomeModalControl.setFalse}
        openUpdateProfileModal={openUpdateProfileModal}
      />
      <UpdateProfileModal
        isOpen={updateProfileModalControl.value}
        onClose={updateProfileModalControl.setFalse}
        currentUser={currentUser!}
      />
      {walkthroughEnable && (
        <>
          <OnboardingOrderModal
            isOpen={onBoardingModal.value}
            onClose={onBoardingModal.setFalse}
            isDuringTour={tourControl.value}
          />
          <OnboardingTour
            isTourOpen={tourControl.value}
            closeTour={handleCloseWalkThrough}
          />
        </>
      )}
      <BottomNavigationBar />
    </ParticipantLayout>
  );
};

export default OrderListPage;
