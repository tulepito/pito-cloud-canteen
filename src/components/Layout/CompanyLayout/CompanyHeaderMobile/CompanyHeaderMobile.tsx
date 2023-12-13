import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import HamburgerMenuButton from '@components/HamburgerMenuButton/HamburgerMenuButton';
import IconBell from '@components/Icons/IconBell/IconBell';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconPhone from '@components/Icons/IconPhone/IconPhone';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useLogout } from '@hooks/useLogout';
import { useViewport } from '@hooks/useViewport';
import { UIActions } from '@redux/slices/UI.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import config from '@src/configs';
import { generalPaths, personalPaths } from '@src/paths';
import { CurrentUser } from '@src/utils/data';
import type { TCurrentUser, TObject } from '@src/utils/types';

import css from './CompanyHeaderMobile.module.scss';

type CompanyHeaderMobileProps = {
  className?: string;
  companyHeaderLinkData: {
    key: string;
    path: string;
    label: string | ReactNode;
  }[];
  headerData: {
    key: string;
    title: ReactNode;
    pathname: string;
    query?: TObject;
  }[];
  companyId: string;
};

const CompanyHeaderMobile: React.FC<CompanyHeaderMobileProps> = (props) => {
  const { className, companyHeaderLinkData, headerData } = props;

  const { value: isOpen, toggle: onToggle } = useBoolean(false);
  const { isMobileLayout } = useViewport();

  const { pathname: routerPathName, push } = useRouter();
  const currentUser = useAppSelector(currentUserSelector);
  const dispatch = useAppDispatch();
  const handleLogoutFn = useLogout();

  const currentUserGetter = CurrentUser(currentUser);
  const { lastName = '', firstName = '' } = currentUserGetter.getProfile();
  const currentUserFullName = `${lastName} ${firstName}`;

  useEffect(() => {
    if (isOpen) {
      dispatch(UIActions.disableScrollRequest('CompanyHeaderMobile'));
    }

    return () => {
      dispatch(UIActions.disableScrollRemove('CompanyHeaderMobile'));
    };
  }, [dispatch, isOpen]);

  const { key: activeKey } =
    headerData.find(({ pathname }) =>
      pathname === '/'
        ? routerPathName === pathname
        : routerPathName.includes(pathname),
    ) || {};

  const classes = classNames(css.root, className);

  const handleRedirect =
    (path: string, query: TObject = {}) =>
    () => {
      push({
        pathname: path,
        query,
      });
      onToggle();
    };

  const handleLogout = async () => {
    await handleLogoutFn();
    push(generalPaths.Home);
  };

  const renderRightIcon = () => {
    if (isMobileLayout) {
      return <IconBell className={css.iconBell} />;
    }

    return !isOpen ? (
      <HamburgerMenuButton onClick={onToggle} />
    ) : (
      <InlineTextButton type="button" onClick={onToggle}>
        <IconClose className={css.iconClose} />
      </InlineTextButton>
    );
  };

  return (
    <div className={classes}>
      <PitoLogo variant="secondary" />

      {renderRightIcon()}
      {isOpen && !isMobileLayout && (
        <div className={css.mobileMenuWrapper}>
          <div className={css.companyHeaderLinks}>
            {companyHeaderLinkData.map((item) => (
              <InlineTextButton
                onClick={handleRedirect(item.path)}
                key={item.key}
                className={css.companyHeaderLink}>
                {item.label}
              </InlineTextButton>
            ))}
          </div>
          <div className={css.separator}></div>
          <div className={css.headerLinks}>
            {headerData.map(({ key, title, pathname, query }) => {
              const activeHeaderItemClasses = classNames(css.headerItem, {
                [css.active]: key === activeKey,
              });
              const hrefObject = !isEmpty(query)
                ? { pathname, query }
                : pathname;

              return (
                <Link
                  onClick={handleRedirect(pathname, query)}
                  key={key}
                  className={activeHeaderItemClasses}
                  href={hrefObject}>
                  <div className={css.title}>{title}</div>
                </Link>
              );
            })}
          </div>
          <div className={css.separator}></div>
          <div className={css.headerBottoms}>
            <Link
              key="profile"
              onClick={handleRedirect(personalPaths.Account)}
              href={personalPaths.Account}>
              <div className={css.headerBottomItem}>
                <Avatar
                  user={currentUser as TCurrentUser}
                  disableProfileLink={true}
                />
                <div className={css.userDisplayName}>{currentUserFullName}</div>
              </div>
            </Link>
            <div className={css.headerBottomItem}>
              <IconPhone variant="secondary" className={css.phoneIcon} />
              <div className={css.phoneNumber}>
                {config.marketplacePhoneNumber}
              </div>
            </div>
            <div className={css.headerBottomItem} onClick={handleLogout}>
              <IconLogout />
              <div className={css.phoneNumber}>
                <FormattedMessage id="CompanyHeaderMobile.logout" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyHeaderMobile;
