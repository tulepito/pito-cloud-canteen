/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';

import UpdateProfileModal from './components/UpdateProfileModal/UpdateProfileModal';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import { OrderListThunks } from './OrderList.slice';

const OrderListPage = () => {
  const dispatch = useAppDispatch();
  const welcomeModalControl = useBoolean(true);
  const updateProfileModalControl = useBoolean();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  useEffect(() => {
    dispatch(OrderListThunks.fetchAttributes());
  }, []);
  const openUpdateProfileModal = () => {
    updateProfileModalControl.setTrue();
  };

  return (
    <>
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
      <BottomNavigationBar />
    </>
  );
};

export default OrderListPage;
