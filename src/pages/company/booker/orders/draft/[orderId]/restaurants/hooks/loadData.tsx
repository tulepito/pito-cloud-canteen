import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';
import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

import { BookerSelectRestaurantThunks } from '../BookerSelectRestaurant.slice';

export const useLoadData = ({ orderId }: { orderId: string }) => {
  const order = useAppSelector((state) => state.Order.order);
  const fetchOrderInProgress = useAppSelector(
    (state) => state.Order.fetchOrderInProgress,
  );
  const fetchOrderError = useAppSelector(
    (state) => state.Order.fetchOrderError,
  );

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
    dispatch(BookerSelectRestaurantThunks.fetchOrder(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    dispatch(BookerSelectRestaurantThunks.fetchCompanyAccount(companyId));
  }, [dispatch, companyId]);

  return {
    order,
    fetchOrderInProgress,
    fetchOrderError,
    companyAccount,
    fetchCompanyAccountInProgress,
    fetchCompanyAccountError,
  };
};

export const useLoadPlanDetails = () => {
  const order = useAppSelector((state) => state.BookerSelectRestaurant.order);
  const planDetail = useAppSelector(
    (state) => state.BookerSelectRestaurant.planDetail,
  );
  const { plans = [] } = Listing(order as TListing).getMetadata();
  const planId = plans[0];

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(BookerSelectRestaurantThunks.fetchPlanDetail(planId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  return {
    orderId: order?.id?.uuid,
    planId,
    planDetail,
  };
};
