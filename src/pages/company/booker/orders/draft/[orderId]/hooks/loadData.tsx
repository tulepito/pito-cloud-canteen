import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { BookerDraftOrderPageThunks } from '@redux/slices/BookerDraftOrderPage.slice';
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
    (async () => {
      await dispatch(orderAsyncActions.fetchOrder(orderId));
      await dispatch(BookerDraftOrderPageThunks.fetchCompanyFromOrder());
    })();
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
      dispatch(orderAsyncActions.fetchOrderDetail());
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
