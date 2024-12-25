/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { getCompanyIdFromBookerUser } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { CurrentUser, User } from '@src/utils/data';
import type { TCurrentUser, TUser } from '@src/utils/types';

import CompanyDashboardHeroSection from './components/CompanyDashboardHeroSection/CompanyDashboardHeroSection';
import NotificationSection from './components/NotificationSection/NotificationSection';
import OrdersAnalysisSection from './components/OrdersAnalysisSection/OrdersAnalysisSection';
import ReportSection from './components/ReportSection/ReportSection';

import css from './CompanyDashboard.module.scss';

const CompanyDashboardPage = () => {
  const dispatch = useAppDispatch();
  const {
    query: { companyId },
    isReady,
    pathname,
    replace,
  } = useRouter();

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserId = CurrentUser(currentUser as TCurrentUser).getId();
  const totalItemMap = useAppSelector((state) => state.Order.totalItemMap);
  const bookerCompanies = useAppSelector(
    (state) => state.BookerCompanies.companies,
  );
  const companyOrderNotificationMap = useAppSelector(
    (state) => state.Order.companyOrderNotificationMap,
  );
  const companyOrderSummary = useAppSelector(
    (state) => state.Order.companyOrderSummary,
  );
  const queryOrderInProgress = useAppSelector(
    (state) => state.Order.queryOrderInProgress,
  );
  const getCompanyOrderNotificationInProgress = useAppSelector(
    (state) => state.Order.getOrderNotificationInProgress,
  );
  const getCompanyOrderSummaryInProgress = useAppSelector(
    (state) => state.Order.getCompanyOrderSummaryInProgress,
  );

  useEffect(() => {
    if (
      isReady &&
      (!companyId || companyId === '[companyId]' || companyId === 'personal')
    ) {
      replace({
        pathname,
        query: { companyId: getCompanyIdFromBookerUser(currentUser!) },
      });
    }
  }, [
    isReady,
    JSON.stringify(companyId as string),
    JSON.stringify(currentUser),
  ]);

  useEffect(() => {
    if (!companyId || !currentUserId) return;

    const isPersonal = companyId === 'personal';
    const companyIdToQuery = isPersonal ? currentUserId : companyId;

    const companyUser = bookerCompanies.find(
      (c: TUser) => c.id.uuid === companyIdToQuery,
    );
    const { subAccountId: subAccountIdMaybe } = User(
      companyUser!,
    ).getPrivateData();
    const authorIdMaybe =
      typeof subAccountIdMaybe !== 'undefined'
        ? { authorId: subAccountIdMaybe }
        : {};

    dispatch(
      orderAsyncActions.queryCompanyOrders({
        companyId: companyIdToQuery,
        bookerId: currentUserId,
        ...authorIdMaybe,
      }),
    );
    dispatch(
      orderAsyncActions.getCompanyOrderNotification(companyIdToQuery as string),
    );
    dispatch(
      orderAsyncActions.getCompanyOrderSummary(companyIdToQuery as string),
    );
  }, [dispatch, companyId, currentUserId, JSON.stringify(bookerCompanies)]);

  return (
    <div className={css.root}>
      <CompanyDashboardHeroSection />
      <div className={css.container}>
        <div className={css.groupSections}>
          <OrdersAnalysisSection
            totalItemMap={totalItemMap}
            inProgress={queryOrderInProgress}
          />
          <NotificationSection
            inProgress={getCompanyOrderNotificationInProgress}
            companyOrderNotificationMap={companyOrderNotificationMap}
          />
        </div>
        <div className={css.groupSections}>
          <ReportSection
            inProgress={getCompanyOrderSummaryInProgress}
            companyOrderSummary={companyOrderSummary}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;
