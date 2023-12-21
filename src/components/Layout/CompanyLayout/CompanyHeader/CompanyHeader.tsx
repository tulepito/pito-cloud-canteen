import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconSwap from '@components/Icons/IconSwap/IconSwap';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import { currentUserSelector } from '@redux/slices/user.slice';
import config from '@src/configs';
import { companyPaths } from '@src/paths';
import { CurrentUser } from '@src/utils/data';

import css from './CompanyHeader.module.scss';

type CompanyHeaderProps = {
  showBottomLine?: boolean;
  companyHeaderLinkData: {
    key: string;
    path: string;
    label: string | ReactNode;
  }[];
  companyId: string;
};

const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  showBottomLine,
  companyHeaderLinkData,
  companyId,
}) => {
  const router = useRouter();
  const handleLogoutFn = useLogout();
  const { onOpenRoleSelectModal } = useRoleSelectModalController();
  const currentUser = useAppSelector(currentUserSelector);
  const currentUserGetter = CurrentUser(currentUser);
  const { firstName, lastName } = currentUserGetter.getProfile();
  const { email } = currentUserGetter.getAttributes();
  const fullName = `${lastName} ${firstName}`;

  const handleLogout = async () => {
    await handleLogoutFn();
    router.push('/');
  };

  const handleGoToAccountSettingPage = () => {
    router.push(companyPaths.Account);
  };

  const classes = classNames(css.root, showBottomLine && css.bottomLine);

  return (
    <div className={classes}>
      <div className={css.headerLeft}>
        <NamedLink path={companyPaths.Home} params={{ companyId }}>
          <PitoLogo variant="secondary" className={css.logo} />
        </NamedLink>
        <div className={css.headerLinks}>
          {companyHeaderLinkData.map((item) => (
            <NamedLink
              key={item.key}
              className={css.headerLink}
              path={item.path}>
              {item.label}
            </NamedLink>
          ))}
        </div>
      </div>
      <div className={css.headerRight}>
        <p className={css.headerPhoneNumber}>{config.marketplacePhoneNumber}</p>
        <div className={css.separator}></div>
        <ProfileMenu>
          <ProfileMenuLabel className={css.profileMenuWrapper}>
            <div className={css.avatar}>
              <Avatar disableProfileLink user={currentUser} />
            </div>
          </ProfileMenuLabel>
          <ProfileMenuContent className={css.profileMenuContent}>
            <ProfileMenuItem key="User Information">
              <div className={css.text}>{fullName}</div>
              <div className={css.subText}>{email}</div>
            </ProfileMenuItem>
            <ProfileMenuItem
              key="AccountSettingPage"
              className={css.menuItem}
              onClick={handleGoToAccountSettingPage}>
              <IconUser />
              <div className={css.text}>Tài khoản</div>
            </ProfileMenuItem>
            <ProfileMenuItem
              key="ChangeRole"
              className={css.menuItem}
              onClick={onOpenRoleSelectModal}>
              <IconSwap className={css.iconSwap} />
              <div className={css.text}>Đổi vai trò</div>
            </ProfileMenuItem>

            <ProfileMenuItem
              key="Logout"
              className={css.menuItem}
              onClick={handleLogout}>
              <IconLogout className={css.logoutIcon} />
              <div className={css.logout}>Đăng xuất</div>
            </ProfileMenuItem>
          </ProfileMenuContent>
        </ProfileMenu>
      </div>
    </div>
  );
};

export default CompanyHeader;
