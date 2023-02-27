import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { useEffect } from 'react';

import { normalizePlanDetailsToEvent } from '../helpers/normalizeData';

export const useLoadData = ({ orderId }: { orderId: string }) => {
  const order = useAppSelector((state) => state.Order.order);
  const fetchOrderInProgress = useAppSelector(
    (state) => state.Order.fetchOrderInProgress,
  );
  const fetchOrderError = useAppSelector(
    (state) => state.Order.fetchOrderError,
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(orderAsyncActions.fetchOrder(orderId));
  }, [dispatch, orderId]);

  return {
    order,
    fetchOrderInProgress,
    fetchOrderError,
  };
};

export const useLoadPlanDetails = () => {
  const order = useAppSelector((state) => state.Order.order);
  const orderDetail = useAppSelector((state) => state.Order.orderDetail);
  const fetchOrderDetailInProgress = useAppSelector(
    (state) => state.Order.fetchOrderDetailInProgress,
  );
  const fetchOrderDetailError = useAppSelector(
    (state) => state.Order.fetchOrderDetailError,
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (order) {
      dispatch(orderAsyncActions.fetchOrderDetail(order));
    }
  }, [dispatch, order]);

  const normalizeData = normalizePlanDetailsToEvent(orderDetail, order);

  return {
    rawOrderDetail: orderDetail,
    orderDetail: normalizeData,
    fetchOrderDetailInProgress,
    fetchOrderDetailError,
  };
};
