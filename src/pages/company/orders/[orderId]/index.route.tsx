import Meta from '@components/Layout/Meta';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { UserPermission } from '@src/types/UserPermission';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import CompanyOrderDetailPage from './components/CompanyOrderDetail.page';
import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from './picking/OrderManagement.slice';

const CompanyOrderDetailRoute = () => {
  const intl = useIntl();
  const pageTitle = intl.formatMessage({ id: 'CompanyOrderDetailPage.title' });

  const dispatch = useAppDispatch();
  const pageDataLoading = useAppSelector(orderDetailsAnyActionsInProgress);
  const { companyId } = useAppSelector((state) => state.OrderManagement);
  const currentUser = useAppSelector(currentUserSelector);
  const companyData = get(currentUser, 'attributes.profile.metadata.company');
  const {
    isReady,
    query: { orderId },
    push,
  } = useRouter();

  useEffect(() => {
    if (isReady && !isEmpty(orderId)) {
      dispatch(orderManagementThunks.loadData(orderId as string));
    }
  }, [dispatch, isReady, orderId]);

  useEffect(() => {
    if (!pageDataLoading && companyData && companyId !== null) {
      const permissionData = companyData[companyId as string] || {};

      if (permissionData.permission !== UserPermission.BOOKER) {
        push(companyPaths.Home);
      }
    }
  }, [pageDataLoading, companyId, companyData, push]);

  return (
    <>
      <Meta title={pageTitle} />
      <CompanyOrderDetailPage />
    </>
  );
};

export default CompanyOrderDetailRoute;
