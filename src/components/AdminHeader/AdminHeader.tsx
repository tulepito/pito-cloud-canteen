// eslint-disable-next-line import/no-named-as-default
import Avatar from '@components/Avatar/Avatar';
import IconArrow from '@components/IconArrow/IconArrow';
import IconBell from '@components/IconBell/IconBell';
import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import React from 'react';

import css from './AdminHeader.module.scss';

type TAdminHeader = {
  onMenuClick: () => void;
};

const AdminHeader: React.FC<TAdminHeader> = () => {
  const currentUser = useAppSelector(currentUserSelector);
  return (
    <div className={css.root}>
      <div className={css.headerRight}>
        <PitoLogo />
      </div>
      <div className={css.headerLeft}>
        <IconBell className={css.iconBell} />
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
