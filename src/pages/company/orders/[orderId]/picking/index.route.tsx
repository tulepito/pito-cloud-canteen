import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Meta from '@components/Layout/Meta';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { UserPermission } from '@src/types/UserPermission';
import { CurrentUser } from '@utils/data';

import BookerOrderDetailsPage from './components/BookerOrderDetails.page';
import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from './OrderManagement.slice';

const BookerOrderDetailsRoute = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pageDataLoading = useAppSelector(orderDetailsAnyActionsInProgress);
  const { companyId } = useAppSelector((state) => state.OrderManagement);
  const currentUser = useAppSelector(currentUserSelector);
  const { company: companyData } = CurrentUser(currentUser).getMetadata();

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
      <Meta
        title={intl.formatMessage({ id: 'BookerOrderDetailsRoute.title' })}
      />
      <BookerOrderDetailsPage />
    </>
  );
};

export default BookerOrderDetailsRoute;
