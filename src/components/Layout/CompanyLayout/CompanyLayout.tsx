import Dropdown from '@components/CompanyLayout/Dropdown/Dropdown';
import FeatureIcons from '@components/FeatureIcons/FeatureIcons';
import FeaturesHeader from '@components/FeaturesHeader/FeaturesHeader';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths, personalPaths } from '@src/paths';
import { CURRENT_USER, USER } from '@utils/data';
import type { TUser } from '@utils/types';
import filter from 'lodash/filter';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';

import CompanyHeader from './CompanyHeader/CompanyHeader';
import {
  shouldShowFeatureHeader,
  shouldShowSidebar,
} from './companyLayout.helpers';
import CompanyMainContent from './CompanyMainContent/CompanyMainContent';
import CompanySidebar from './CompanySidebar/CompanySidebar';

const companySettingPaths = [
  companyPaths.Account,
  companyPaths.Members,
  companyPaths.GroupSetting,
  companyPaths.Logo,
];
const CompanyLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { companyId } = router.query;
  const { pathname } = router;

  const showFeatureHeader = shouldShowFeatureHeader(router.pathname);
  const showSidebar = shouldShowSidebar(pathname);

  const currentUser = useAppSelector(currentUserSelector);
  const companyRefs = useAppSelector(
    (state) => state.ManageCompaniesPage.companyRefs,
    shallowEqual,
  );
  const { companyList = [] } = CURRENT_USER(currentUser).getMetadata();
  const assignedCompanies = filter(companyRefs, (o: any) =>
    companyList.includes(o.id.uuid),
  ).reduce((result: any[], cur: TUser) => {
    return [
      ...result,
      {
        value: USER(cur).getId(),
        label: USER(cur).getPublicData()?.companyName,
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
    if (companySettingPaths.includes(pathname)) {
      return pathname;
    }

    if (pathname === companyPaths.MembersDetail) {
      return companyPaths.Members;
    }

    if (pathname === companyPaths.GroupMemberDetail) {
      return companyPaths.GroupSetting;
    }

    return companyPaths.Account;
  };

  const featureHeaderData = [
    {
      key: 'cart',
      icon: <FeatureIcons.Cart />,
      title: 'Đặt hàng',
      pathname: '/',
    },
    {
      key: 'order',
      icon: <FeatureIcons.Box />,
      title: 'Đơn hàng',
      pathname: '/',
    },
    {
      key: 'invoice',
      icon: <FeatureIcons.Invoice />,
      title: 'Hoá đơn',
      pathname: '/',
    },
    {
      key: 'review',
      icon: <FeatureIcons.Star />,
      title: 'Đánh giá',
      pathname: '/',
    },
    {
      key: 'introduce',
      icon: <FeatureIcons.UserCirclePlus />,
      title: 'Giới thiệu',
      pathname: '/',
    },
    {
      key: 'account',
      icon: <FeatureIcons.User />,
      title: (
        <Dropdown
          options={accountOptions}
          selectedValue={selectedAccount}
          setSelectedValue={setSelectedAccount}
        />
      ),
      query: {
        ...(selectedAccount.value ? { companyId: selectedAccount.value } : {}),
      },
      pathname: selectedAccount.value
        ? changePathnameByCompanyId()
        : personalPaths.Account,
    },
  ];

  useEffect(() => {
    dispatch(manageCompaniesThunks.queryCompanies());
  }, [dispatch]);

  useEffect(() => {
    if (companyId) {
      const currentCompany = companyRefs.find(
        (_company) => USER(_company).getId() === companyId,
      );
      setSelectedAccount({
        value: USER(currentCompany).getId(),
        label: USER(currentCompany).getPublicData()?.companyName,
      });
    }
  }, [companyId]);

  return (
    <>
      <CompanyHeader />
      {showFeatureHeader && <FeaturesHeader headerData={featureHeaderData} />}
      {showSidebar && <CompanySidebar />}
      <CompanyMainContent
        hasHeader={showFeatureHeader}
        hasSideBar={showSidebar}>
        {children}
      </CompanyMainContent>
    </>
  );
};

export default CompanyLayout;
