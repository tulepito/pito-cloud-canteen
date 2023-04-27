/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { CurrentUser } from '@src/utils/data';

import OnboardingOrderModal from './components/OnboardingOrderModal/OnboardingOrderModal';
import OnboardingTour from './components/OnboardingTour/OnboardingTour';
import UpdateProfileModal from './components/UpdateProfileModal/UpdateProfileModal';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import { OrderListThunks } from './OrderList.slice';

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
  useEffect(() => {
    dispatch(OrderListThunks.fetchAttributes());
  }, []);
  const openUpdateProfileModal = () => {
    updateProfileModalControl.setTrue();
  };

  const handleOnBoardingModalOpen = () => {
    onBoardingModal.setTrue();
    setTimeout(() => {
      tourControl.setTrue();
    }, 1000);
  };
  const handleCloseWalkThrough = () => {
    tourControl.setFalse();
    onBoardingModal.setFalse();
    dispatch(OrderListThunks.disableWalkthrough(currentUserId));
  };

  return (
    <>
      <div onClick={handleOnBoardingModalOpen}>Open</div>
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
    </>
  );
};

export default OrderListPage;
