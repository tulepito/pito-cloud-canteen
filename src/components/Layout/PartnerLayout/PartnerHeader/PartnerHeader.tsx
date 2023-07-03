// eslint-disable-next-line import/no-named-as-default
import React from 'react';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconBell from '@components/Icons/IconBell/IconBell';
import IconMail from '@components/Icons/IconMail/IconMail';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';

import css from './PartnerHeader.module.scss';

type TPartnerHeaderProps = {
  onMenuClick: () => void;
};

const PartnerHeader: React.FC<TPartnerHeaderProps> = () => {
  const currentUser = useAppSelector(currentUserSelector);
  const router = useRouter();
  const handleLogoutFn = useLogout();

  const currentUserGetter = CurrentUser(currentUser);
  const { lastName = '', firstName = '' } = currentUserGetter.getProfile();
  const currentUserFullName = `${lastName} ${firstName}`;

  const onLogout = async () => {
    await handleLogoutFn();

    router.push('/');
  };

  return (
    <div className={css.root}>
      <div className={css.headerRight}>
        <PitoLogo className={css.logo} />
      </div>
      <div className={css.headerLeft}>
        <div className={css.actionContainer}>
          <InlineTextButton type="button">
            <IconMail className={css.iconMail} />
          </InlineTextButton>
          <InlineTextButton type="button">
            <IconBell className={css.iconBell} />
          </InlineTextButton>
        </div>
        <div className={css.line}></div>
        <ProfileMenu>
          <ProfileMenuLabel className={css.profileMenuWrapper}>
            <div className={css.avatar}>
              <Avatar disableProfileLink user={currentUser} />
            </div>
            <p className={css.displayName}>{currentUserFullName}</p>
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

export default PartnerHeader;
