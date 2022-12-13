import IconBell from '@components/IconBell/IconBell';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import React from 'react';

import css from './AdminHeader.module.scss';

const AdminHeader = () => {
  return (
    <div className={css.root}>
      <div className={css.headerLeft}>
        <IconBell className={css.iconBell} />
        <ProfileMenu>
          <ProfileMenuLabel className={css.profileMenuWrapper}>
            <div className={css.avatar}>
              <span>A</span>
            </div>
            <p>Admin</p>
          </ProfileMenuLabel>
          <ProfileMenuContent className={css.profileMenuContent}>
            <ProfileMenuItem key="AccountSettingsPage">
              <button>
                <p>Dang xuat</p>
              </button>
            </ProfileMenuItem>
            <ProfileMenuItem key="ABC">
              <button>
                <p>Dang xuat</p>
              </button>
            </ProfileMenuItem>
          </ProfileMenuContent>
        </ProfileMenu>
      </div>
    </div>
  );
};

export default AdminHeader;
