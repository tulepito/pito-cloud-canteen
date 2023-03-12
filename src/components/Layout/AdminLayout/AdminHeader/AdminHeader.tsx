// eslint-disable-next-line import/no-named-as-default
import React from 'react';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconBell from '@components/Icons/IconBell/IconBell';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { currentUserSelector, userActions } from '@redux/slices/user.slice';

import css from './AdminHeader.module.scss';

type TAdminHeaderProps = {
  onMenuClick: () => void;
};

const AdminHeader: React.FC<TAdminHeaderProps> = () => {
  const currentUser = useAppSelector(currentUserSelector);
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
        <PitoLogo className={css.logo} />
      </div>
      <div className={css.headerLeft}>
        <InlineTextButton type="button">
          <IconBell className={css.iconBell} />
        </InlineTextButton>
        <div className={css.line}></div>
        <ProfileMenu>
          <ProfileMenuLabel className={css.profileMenuWrapper}>
            <div className={css.avatar}>
              <Avatar disableProfileLink user={currentUser} />
            </div>
            <p className={css.displayName}>
              {currentUser?.attributes?.profile?.displayName}
            </p>
            <IconArrow direction="down" />
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
