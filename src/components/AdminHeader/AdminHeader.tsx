// eslint-disable-next-line import/no-named-as-default
import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import HamburgerMenuButton from '@components/HamburgerMenuButton/HamburgerMenuButton';
import IconBell from '@components/IconBell/IconBell';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';
import { useRouter } from 'next/router';
import React from 'react';

import css from './AdminHeader.module.scss';

type TAdminHeader = {
  onMenuClick: () => void;
};

const AdminHeader: React.FC<TAdminHeader> = (props) => {
  const { onMenuClick } = props;
  const { currentUser } = useAppSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onLogout = async () => {
    await dispatch(authThunks.logout());
    await dispatch(userActions.clearCurrentUser());

    router.push('/');
  };
  return (
    <div className={css.root}>
      <div className={css.headerRight}>
        <HamburgerMenuButton onClick={onMenuClick} />
      </div>
      <div className={css.headerLeft}>
        <IconBell className={css.iconBell} />
        <ProfileMenu>
          <ProfileMenuLabel className={css.profileMenuWrapper}>
            <div className={css.avatar}>
              <Avatar disableProfileLink user={currentUser} />
            </div>
            <p>{currentUser?.attributes?.profile?.displayName}</p>
          </ProfileMenuLabel>
          <ProfileMenuContent className={css.profileMenuContent}>
            <ProfileMenuItem key="AccountSettingsPage">
              <InlineTextButton type="button" onClick={onLogout}>
                <p>Đăng xuất</p>
              </InlineTextButton>
            </ProfileMenuItem>
          </ProfileMenuContent>
        </ProfileMenu>
      </div>
    </div>
  );
};

export default AdminHeader;
