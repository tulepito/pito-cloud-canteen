/* eslint-disable react-hooks/exhaustive-deps */
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

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
    })();
  }, [dispatch, orderId]);

  return {
    order,
    fetchOrderInProgress,
    fetchOrderError,
    companyAccount,
  };
};

export const useLoadPlanDetails = () => {
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

  useEffect(() => {
    if (order) {
      dispatch(orderAsyncActions.fetchOrderDetail(order));
    }
  }, [dispatch, JSON.stringify(order)]);

  useEffect(() => {
    if (orderDetail && orderDetail.length > 0) {
      dispatch(orderAsyncActions.fetchRestaurantCoverImages());
    }
  }, [dispatch, JSON.stringify(orderDetail)]);

  const normalizeData = useMemo(() => {
    return normalizePlanDetailsToEvent(
      orderDetail,
      order,
      restaurantCoverImageList,
    );
  }, [
    JSON.stringify(restaurantCoverImageList),
    JSON.stringify(order),
    JSON.stringify(orderDetail),
  ]);

  return {
    rawOrderDetail: orderDetail,
    orderDetail: normalizeData,
    fetchOrderDetailInProgress,
    fetchOrderDetailError,
  };
};
