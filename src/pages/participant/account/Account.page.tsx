/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { participantPaths } from '@src/paths';

import AvatarForm from './components/AvatarForm/AvatarForm';
import { AccountThunks } from './Account.slice';

import css from './Account.module.scss';

const AccountPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  useEffect(() => {
    dispatch(AccountThunks.fetchAttributes());
  }, []);

  const openProfileModal = () => {
    router.push(participantPaths.AccountProfile);
  };

  const openChangePasswordModal = () => {
    router.push(participantPaths.AccountChangePassword);
  };

  const openSpecialDemandModal = () => {
    router.push(participantPaths.AccountSpecialDemand);
  };

  const onLogout = () => {
    dispatch(authThunks.logout());
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
        <div className={css.navigationItem} onClick={onLogout}>
          <div className={css.iconGroup}>
            <IconLogout />
            <span>Đăng xuất</span>
          </div>
          <IconArrow direction="right" />
        </div>
      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default AccountPage;
