// eslint-disable-next-line import/no-named-as-default
import Avatar from '@components/Avatar/Avatar';
import HamburgerMenuButton from '@components/HamburgerMenuButton/HamburgerMenuButton';
import IconBell from '@components/IconBell/IconBell';
import NamedLink from '@components/NamedLink/NamedLink';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppSelector } from '@hooks/reduxHooks';
import React from 'react';

import css from './AdminHeader.module.scss';

type TAdminHeader = {
  onMenuClick: () => void;
};

const AdminHeader: React.FC<TAdminHeader> = (props) => {
  const { onMenuClick } = props;
  const { currentUser } = useAppSelector((state) => state.user);
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
              <NamedLink>
                <p>Dang xuat</p>
              </NamedLink>
            </ProfileMenuItem>
          </ProfileMenuContent>
        </ProfileMenu>
      </div>
    </div>
  );
};

export default AdminHeader;
