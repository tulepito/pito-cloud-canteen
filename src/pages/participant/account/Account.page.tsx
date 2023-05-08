/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';

import AvatarForm from './components/AvatarForm/AvatarForm';
import ChangePasswordModal from './components/ChangePasswordModal/ChangePasswordModal';
import ProfileModal from './components/ProfileModal/ProfileModal';
import SpecialDemandModal from './components/SpecialDemandModal/SpecialDemandModal';
import { AccountThunks } from './Account.slice';

import css from './Account.module.scss';

const AccountPage = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const profileModalControl = useBoolean();
  const changePasswordModalControl = useBoolean();
  const specialDemandModalControl = useBoolean();
  const nutritionOptions = useAppSelector(
    (state) => state.ParticipantAccount.nutritions,
    shallowEqual,
  );
  useEffect(() => {
    dispatch(AccountThunks.fetchAttributes());
  }, []);

  const openProfileModal = () => {
    profileModalControl.setTrue();
  };

  const openChangePasswordModal = () => {
    changePasswordModalControl.setTrue();
  };

  const openSpecialDemandModal = () => {
    specialDemandModalControl.setTrue();
  };

  return (
    <div className={css.container}>
      <div className={css.greyCircle}></div>
      <div className={css.avatarSection}>
        <AvatarForm onSubmit={() => {}} currentUser={currentUser!} />
      </div>
      <div className={css.navigationWrapper}>
        <div className={css.navigationItem} onClick={openProfileModal}>
          <div className={css.iconGroup}>
            <IconUser />
            <span>Tài khoản cá nhân</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.navigationItem} onClick={openChangePasswordModal}>
          <div className={css.iconGroup}>
            <IconLock />
            <span>Đổi mật khẩu</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.navigationItem} onClick={openSpecialDemandModal}>
          <div className={css.iconGroup}>
            <IconFood />
            <span>Yêu cầu đặc biệt</span>
          </div>
          <IconArrow direction="right" />
        </div>
      </div>
      <ProfileModal
        isOpen={profileModalControl.value}
        onClose={profileModalControl.setFalse}
        currentUser={currentUser!}
      />
      <ChangePasswordModal
        isOpen={changePasswordModalControl.value}
        onClose={changePasswordModalControl.setFalse}
      />
      <SpecialDemandModal
        isOpen={specialDemandModalControl.value}
        onClose={specialDemandModalControl.setFalse}
        nutritionOptions={nutritionOptions}
        currentUser={currentUser!}
      />
      <BottomNavigationBar />
    </div>
  );
};

export default AccountPage;
