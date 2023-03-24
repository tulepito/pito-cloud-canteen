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
import IconClose from '@components/Icons/IconClose/IconClose';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconPhone from '@components/Icons/IconPhone/IconPhone';
import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { UIActions } from '@redux/slices/UI.slice';
import config from '@src/configs';
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

  const { pathname: routerPathName } = useRouter();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const dispatch = useAppDispatch();
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

  return (
    <div className={classes}>
      <PitoLogo variant="secondary" />
      {!isOpen ? (
        <HamburgerMenuButton onClick={onToggle} />
      ) : (
        <InlineTextButton type="button" onClick={onToggle}>
          <IconClose className={css.iconClose} />
        </InlineTextButton>
      )}
      {isOpen && (
        <div className={css.mobileMenuWrapper}>
          <div className={css.companyHeaderLinks}>
            {companyHeaderLinkData.map((item) => (
              <NamedLink
                key={item.key}
                className={css.companyHeaderLink}
                path={item.path}>
                {item.label}
              </NamedLink>
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
            <div className={css.headerBottomItem}>
              <Avatar user={currentUser as TCurrentUser} />
              <div className={css.userDisplayName}>
                {
                  CurrentUser(currentUser as TCurrentUser).getProfile()
                    .displayName
                }
              </div>
            </div>
            <div className={css.headerBottomItem}>
              <IconPhone variant="secondary" className={css.phoneIcon} />
              <div className={css.phoneNumber}>
                {config.marketplacePhoneNumber}
              </div>
            </div>
            <div className={css.headerBottomItem}>
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
