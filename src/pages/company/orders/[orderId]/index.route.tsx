/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { UserPermission } from '@src/types/UserPermission';

import CompanyOrderDetailPage from './components/CompanyOrderDetail.page';

const allowedPermissions = [UserPermission.BOOKER, UserPermission.OWNER];

const CompanyOrderDetailRoute = () => {
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
      dispatch(
        orderManagementThunks.loadData({
          orderId: orderId as string,
        }),
      );
    }
  }, [dispatch, isReady, orderId]);

  useEffect(() => {
    if (!pageDataLoading && companyData && companyId !== null) {
      const permissionData = companyData[companyId as string] || {};

      if (!allowedPermissions.includes(permissionData.permission)) {
        push(companyPaths.Home);
      }
    }
  }, [pageDataLoading, companyId, companyData, push]);

  useEffect(() => {
    return () => {
      dispatch(OrderManagementsAction.clearOrderData());
    };
  }, []);

  return (
    <MetaWrapper routeName="CompanyOrderDetailRoute">
      <CompanyOrderDetailPage />
    </MetaWrapper>
  );
};

export default CompanyOrderDetailRoute;
