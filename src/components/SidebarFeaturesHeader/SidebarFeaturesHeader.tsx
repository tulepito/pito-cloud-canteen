import React, { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Collapsible from '@components/Collapsible/Collapsible';
import FeatureIcons from '@components/FeatureIcons/FeatureIcons';
import FeaturesHeader from '@components/FeaturesHeader/FeaturesHeader';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { companySettingPaths } from '@components/Layout/CompanyLayout/CompanyLayout';
import { useAppSelector } from '@hooks/reduxHooks';
import LayoutSidebar from '@pages/company/booker/orders/components/Layout/LayoutSidebar';
import { companyPaths } from '@src/paths';
import { User } from '@src/utils/data';
import type { TUser } from '@src/utils/types';

import css from './SidebarFeaturesHeader.module.scss';

interface SidebarFeaturesHeaderProps {
  collapseNavbar: boolean;
  handleCloseNavbar: () => void;
  companyId: string;
}

const SidebarFeaturesHeader = ({
  collapseNavbar,
  handleCloseNavbar,
  companyId,
}: SidebarFeaturesHeaderProps): JSX.Element => {
  const router = useRouter();
  const companyList = useAppSelector(
    (state) => state.BookerCompanies.companies,
    shallowEqual,
  );

  const assignedCompanies = companyList.reduce((result: any[], cur: TUser) => {
    return [
      ...result,
      {
        value: User(cur).getId(),
        label: 'Công ty',
      },
    ];
  }, []);

  const [selectedAccount, setSelectedAccount] = useState<{
    value?: string;
    label?: string;
  }>({});
  const accountOptions = [
    { value: '', label: 'Cá nhân' },
    ...assignedCompanies,
  ];

  const changePathnameByCompanyId = () => {
    if (companySettingPaths.includes(router.pathname)) {
      return router.pathname;
    }

    if (router.pathname === companyPaths.MembersDetail) {
      return companyPaths.Members;
    }

    if (router.pathname === companyPaths.GroupMemberDetail) {
      return companyPaths.GroupSetting;
    }

    return companyPaths.Account;
  };

  const featureHeaderData = [
    {
      key: 'cart',
      title: (
        <div className={css.headerNavbarItem}>
          <FeatureIcons.Cart />
          <div className={css.title}>Đặt hàng</div>
        </div>
      ),
      pathname: companyPaths.Home,
      extraFunc: () => {
        router.push(companyPaths.Home);
        handleCloseNavbar();
      },
    },
    {
      key: 'order',
      title: (
        <div className={css.headerNavbarItem}>
          <FeatureIcons.Box />
          <div className={css.title}>Đơn hàng</div>
        </div>
      ),
      query: {
        ...(selectedAccount.value
          ? { companyId: selectedAccount.value }
          : { companyId: 'personal' }),
      },
      pathname: companyPaths.ManageOrders,
      shouldActivePathname: [companyPaths.OrderRating],
      extraFunc: () => {
        router.push({
          pathname: companyPaths.ManageOrders,
          query: {
            ...(selectedAccount.value
              ? { companyId: selectedAccount.value }
              : { companyId: 'personal' }),
          },
        });
        handleCloseNavbar();
      },
    },
    {
      key: 'account',
      title: (
        <Collapsible
          rootClassName={css.collapsibleTitle}
          contentClassName={css.collapsibleContent}
          label={
            <div className={css.headerNavbarItem}>
              <FeatureIcons.User />
              <div className={css.title}>Tài khoản</div>
            </div>
          }>
          {accountOptions.map((option) => (
            <div
              key={option.value}
              className={css.dropdownItem}
              onClick={() => setSelectedAccount(option)}>
              {option.label}
            </div>
          ))}
        </Collapsible>
      ),
      query: {
        ...(selectedAccount.value
          ? { companyId: selectedAccount.value }
          : { companyId: 'personal' }),
      },
      pathname: selectedAccount.value
        ? changePathnameByCompanyId()
        : router.pathname,
      extraFunc: () => {
        router.push({
          pathname: selectedAccount.value
            ? changePathnameByCompanyId()
            : router.pathname,
          query: {
            ...(selectedAccount.value
              ? { companyId: selectedAccount.value }
              : { companyId: 'personal' }),
          },
        });
        handleCloseNavbar();
      },
    },
  ];

  useEffect(() => {
    if (companyId && companyId !== 'personal') {
      const currentCompany = companyList.find(
        (_company) => User(_company).getId() === companyId,
      );
      setSelectedAccount({
        value: User(currentCompany!).getId(),
        label: User(currentCompany!).getPublicData().companyName,
      });
    }
  }, [companyId, companyList]);

  return (
    <div className={css.featuresHeaderNavbarMobile}>
      <LayoutSidebar
        logo={<span></span>}
        collapse={collapseNavbar}
        onCollapse={handleCloseNavbar}>
        <div className={css.featuresHeaderMobile}>
          <div className={css.featuresHeaderMobileTitle}>
            <IconArrow direction="left" onClick={handleCloseNavbar} />
            <div className={css.title}>Trở lại</div>
          </div>
          <FeaturesHeader headerData={featureHeaderData} cssCustom={css} />
        </div>
      </LayoutSidebar>
    </div>
  );
};

export default SidebarFeaturesHeader;
