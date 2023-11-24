/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import { BookerDraftOrderPageThunks } from '../BookerDraftOrderPage.slice';
import { normalizePlanDetailsToEvent } from '../helpers/normalizeData';

export const useLoadData = ({ orderId }: { orderId: string }) => {
  const order = useAppSelector((state) => state.Order.order);
  const fetchOrderInProgress = useAppSelector(
    (state) => state.Order.fetchOrderInProgress,
  );
  const fetchOrderError = useAppSelector(
    (state) => state.Order.fetchOrderError,
  );
  const companyAccount = useAppSelector(
    (state) => state.BookerDraftOrderPage.companyAccount,
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(orderAsyncActions.fetchOrder(orderId));
      await dispatch(BookerDraftOrderPageThunks.fetchCompanyAccount());
      dispatch(BookerDraftOrderPageThunks.fetchOrderParticipants());
    })();
  }, [dispatch, orderId]);

  return {
    order,
    fetchOrderInProgress,
    fetchOrderError,
    companyAccount,
  };
};

export const useGetPlanDetails = () => {
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const fetchOrderDetailInProgress = useAppSelector(
    (state) => state.Order.fetchOrderDetailInProgress,
  );
  const fetchOrderDetailError = useAppSelector(
    (state) => state.Order.fetchOrderDetailError,
  );

  const restaurantCoverImageList = useAppSelector(
    (state) => state.Order.restaurantCoverImageList,
    shallowEqual,
  );

  const dispatch = useAppDispatch();
  const orderListing = Listing(order as TListing);
  const { plans, deliveryHour, daySession, orderState } =
    orderListing.getMetadata();

  const normalizeData = useMemo(() => {
    return normalizePlanDetailsToEvent(
      orderDetail,
      {
        plans,
        deliveryHour,
        daySession,
        orderState,
      },
      restaurantCoverImageList,
    );
  }, [
    JSON.stringify(restaurantCoverImageList),
    JSON.stringify(order),
    JSON.stringify(orderDetail),
  ]);

  useEffect(() => {
    if (order) {
      dispatch(orderAsyncActions.fetchOrderDetail(plans));
    }
  }, [dispatch, JSON.stringify(order)]);

  useEffect(() => {
    if (normalizeData && normalizeData.length > 0) {
      dispatch(orderAsyncActions.fetchRestaurantCoverImages({}));
    }
  }, [dispatch, JSON.stringify(normalizeData)]);

  return {
    rawOrderDetail: orderDetail,
    orderDetail: normalizeData,
    fetchOrderDetailInProgress,
    fetchOrderDetailError,
  };
};
