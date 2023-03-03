import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import { BookerSelectRestaurantThunks } from '../BookerSelectRestaurant.slice';

export const useGetCompanyAccount = () => {
  const order = useAppSelector((state) => state.Order.order);

  const companyAccount = useAppSelector(
    (state) => state.BookerSelectRestaurant.companyAccount,
    shallowEqual,
  );
  const fetchCompanyAccountInProgress = useAppSelector(
    (state) => state.BookerSelectRestaurant.fetchCompanyAccountInProgress,
    shallowEqual,
  );
  const fetchCompanyAccountError = useAppSelector(
    (state) => state.BookerSelectRestaurant.fetchCompanyAccountError,
    shallowEqual,
  );

  const { companyId } = Listing((order || {}) as TListing).getMetadata();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(BookerSelectRestaurantThunks.fetchCompanyAccount(companyId));
  }, [dispatch, companyId]);

  return {
    companyAccount,
    fetchCompanyAccountInProgress,
    fetchCompanyAccountError,
  };
};
