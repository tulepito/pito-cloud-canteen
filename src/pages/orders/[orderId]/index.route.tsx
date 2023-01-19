import Meta from '@components/Layout/Meta';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';
import { UserPermission } from '@src/types/UserPermission';
import get from 'lodash/get';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import {
  BookerOrderManagementsThunks,
  orderDetailsAnyActionsInProgress,
} from './BookerOrderManagement.slice';
import BookerOrderDetailsPage from './components/BookerOrderDetails.page';

const BookerOrderDetailsRoute = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pageDataLoading = useAppSelector(orderDetailsAnyActionsInProgress);
  const { companyId } = useAppSelector((state) => state.BookerOrderManagement);
  const currentUser = useAppSelector(currentUserSelector);
  const companyData = get(currentUser, 'attributes.profile.metadata.company');
  const {
    isReady,
    query: { orderId },
    push,
  } = useRouter();

  useEffect(() => {
    if (isReady) {
      dispatch(BookerOrderManagementsThunks.loadData(orderId as string));
    }
  }, [isReady]);

  useEffect(() => {
    if (!pageDataLoading && companyData && companyId !== null) {
      const permissionData = companyData[companyId as string] || {};

      if (permissionData.permission !== UserPermission.BOOKER) {
        push(generalPaths.Home);
      }
    }
  }, [pageDataLoading, companyId]);

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
