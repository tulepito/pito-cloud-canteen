import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Dropdown from '@components/CompanyLayout/Dropdown/Dropdown';
import FeatureIcons from '@components/FeatureIcons/FeatureIcons';
import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import QuizFlow from '@pages/company/booker/orders/new/quiz/QuizFlow';
import { BookerCompaniesThunks } from '@redux/slices/BookerCompanies.slice';
import { companyPaths, personalPaths } from '@src/paths';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import CompanyFooter from './CompanyFooter/CompanyFooter';
import CompanyHeaderWrapper from './CompanyHeaderWrapper/CompanyHeaderWrapper';
import CompanyMainContent from './CompanyMainContent/CompanyMainContent';
import CompanyNavBar from './CompanyNavBar/CompanyNavBar';
import CompanySidebar from './CompanySidebar/CompanySidebar';
import {
  shouldHideCompanyFooter,
  shouldShowFeatureHeader,
  shouldShowSidebar,
} from './companyLayout.helpers';

import css from './CompanyLayout.module.scss';

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

  const quizFlowOpen = useAppSelector((state) => state.Quiz.quizFlowOpen);
  const companyList = useAppSelector(
    (state) => state.BookerCompanies.companies,
    shallowEqual,
  );
  const { isMobileLayout, isTabletLayout } = useViewport();
  const isDesktopLayout = !(isMobileLayout || isTabletLayout);
  const {
    query: { companyId },
    pathname,
  } = router;

  const showFeatureHeader = shouldShowFeatureHeader(pathname);
  const showSidebar = isDesktopLayout && shouldShowSidebar(pathname);
  const shouldHideFooter =
    isMobileLayout || isTabletLayout || shouldHideCompanyFooter(pathname);

  const assignedCompanies = companyList.reduce((result: any[], cur: TUser) => {
    return [
      ...result,
      {
        value: User(cur).getId(),
        label: User(cur).getPublicData().companyName,
        logo: User(cur).getProfileImage(),
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
      title: (
        <div className={css.headerTitle}>
          <FeatureIcons.Cart />
          <div className={css.title}>Đặt hàng</div>
        </div>
      ),
      pathname: companyPaths.Home,
    },
    {
      key: 'order',
      title: (
        <div className={css.headerTitle}>
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
    },
    {
      key: 'account',
      title: (
        <Dropdown
          customTitle={({ title, onMouseEnter, isDropdownOpen, isMobile }) => (
            <div onMouseEnter={onMouseEnter} className={css.headerTitleWrapper}>
              <div className={css.headerTitle}>
                <FeatureIcons.User />
                <div className={css.title} title={title}>
                  {title}
                </div>
              </div>
              {isMobile && (
                <IconArrowHead direction={isDropdownOpen ? 'right' : 'down'} />
              )}
            </div>
          )}
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

  const companyHeaderLinkData: any[] = [];

  const shouldShowCompanyNavBar = [
    companyPaths.Home,
    companyPaths.ManageOrders,
    companyPaths.CreateNewOrder,
    personalPaths.Account,
  ];

  useEffect(() => {
    dispatch(BookerCompaniesThunks.fetchBookerCompanies());
  }, [dispatch]);

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

  const companyName =
    companyId && companyId !== 'personal'
      ? User(
          companyList.find(
            (_company) => User(_company!).getId() === companyId,
          )!,
        ).getPublicData().companyName
      : 'Tài khoản cá nhân';

  useEffect(() => {
    if (!companyId || companyId === '[companyId]') {
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          companyId: 'personal',
        },
      });
    }
  }, [companyId, router]);

  return (
    <>
      <CompanyHeaderWrapper
        companyId={(selectedAccount?.value as string) || 'personal'}
        showFeatureHeader={showFeatureHeader}
        featureHeaderData={featureHeaderData}
        companyHeaderLinkData={companyHeaderLinkData}
      />
      {showSidebar && <CompanySidebar companyName={companyName!} />}
      <CompanyMainContent
        hasHeader={showFeatureHeader}
        hasSideBar={showSidebar}>
        {children}
      </CompanyMainContent>
      {!shouldHideFooter && <CompanyFooter />}
      <RenderWhen condition={quizFlowOpen}>
        <QuizFlow />
      </RenderWhen>
      <RenderWhen condition={shouldShowCompanyNavBar.includes(pathname)}>
        <CompanyNavBar />
      </RenderWhen>
    </>
  );
};

export default CompanyLayout;
