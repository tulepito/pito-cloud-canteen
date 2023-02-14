import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { useEffect } from 'react';

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
  }, []);

  return {
    order,
    fetchOrderInProgress,
    fetchOrderError,
  };
};
