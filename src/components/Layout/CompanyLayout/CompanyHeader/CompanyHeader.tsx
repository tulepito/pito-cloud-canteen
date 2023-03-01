import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconBell from '@components/Icons/IconBell/IconBell';
import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { currentUserSelector, userActions } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React from 'react';

import css from './CompanyHeader.module.scss';

type CompanyHeaderProps = {
  showBottomLine?: boolean;
};

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ showBottomLine }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);

  const onLogout = async () => {
    await dispatch(authThunks.logout());
    await dispatch(userActions.clearCurrentUser());

    router.push('/');
  };

  const classes = classNames(css.root, showBottomLine && css.bottomLine);

  return (
    <div className={classes}>
      <NamedLink className={css.headerLeft} path={companyPaths.Home}>
        <PitoLogo />
      </NamedLink>
      <div className={css.headerRight}>
        <IconBell className={css.iconBell} />
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

export default CompanyHeader;
