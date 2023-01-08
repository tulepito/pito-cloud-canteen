import IconBell from '@components/Icons/IconBell/IconBell';
import PitoLogo from '@components/PITOLogo/PITOLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import React from 'react';

import css from './GeneralHeader.module.scss';

const GeneralHeader = () => {
  return (
    <div className={css.root}>
      <div className={css.headerLeft}>
        <PitoLogo />
      </div>
      <div className={css.headerRight}>
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

export default GeneralHeader;
