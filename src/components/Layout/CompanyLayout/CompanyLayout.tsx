import Dropdown from '@components/CompanyLayout/Dropdown/Dropdown';
import FeatureIcons from '@components/FeatureIcons/FeatureIcons';
import FeaturesHeader from '@components/FeaturesHeader/FeaturesHeader';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { CurrentUser, User } from '@utils/data';
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
  companyPaths.Nutrition,
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
  const { companyList = [] } = CurrentUser(currentUser).getMetadata();
  const assignedCompanies = filter(companyRefs, (o: any) =>
    companyList.includes(o.id.uuid),
  ).reduce((result: any[], cur: TUser) => {
    return [
      ...result,
      {
        value: User(cur).getId(),
        label: User(cur).getPublicData()?.companyName,
      },
    ];
  }, []);
  const [selectedAccount, setSelectedAccount] = useState<{
    value?: string;
    label?: string;
  }>({});
  const accountOptions = [
    { value: '', label: 'Tài khoản' },
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
      pathname: companyPaths.CreateNewOrder,
    },
    {
      key: 'order',
      icon: <FeatureIcons.Box />,
      title: 'Đơn hàng',
      pathname: companyPaths.ManageOrders,
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
      key: 'pitoClub',
      icon: <FeatureIcons.Gift />,
      title: 'PITO club',
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
        ...(selectedAccount.value
          ? { companyId: selectedAccount.value }
          : { companyId: 'personal' }),
      },
      pathname: selectedAccount.value ? changePathnameByCompanyId() : pathname,
    },
  ];

  useEffect(() => {
    dispatch(manageCompaniesThunks.queryCompanies());
  }, [dispatch]);

  useEffect(() => {
    if (companyId && companyId !== 'personal') {
      const currentCompany = companyRefs.find(
        (_company) => User(_company).getId() === companyId,
      );
      setSelectedAccount({
        value: User(currentCompany).getId(),
        label: User(currentCompany).getPublicData()?.companyName,
      });
    }
  }, [companyId, companyRefs]);

  const companyName =
    companyId && companyId !== 'personal'
      ? User(
          companyRefs.find((_company) => User(_company).getId() === companyId),
        ).getPublicData()?.companyName
      : 'Tài khoản cá nhân';
  return (
    <>
      <CompanyHeader />
      {showFeatureHeader && <FeaturesHeader headerData={featureHeaderData} />}
      {showSidebar && <CompanySidebar companyName={companyName!} />}
      <CompanyMainContent
        hasHeader={showFeatureHeader}
        hasSideBar={showSidebar}>
        {children}
      </CompanyMainContent>
    </>
  );
};

export default CompanyLayout;
