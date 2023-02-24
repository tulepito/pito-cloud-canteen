import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';
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

export const useLoadPlanDetails = ({
  coverImageList,
}: {
  coverImageList: any;
}) => {
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

  const dispatch = useAppDispatch();

  const { plans = [] } = Listing(order as TListing).getMetadata();

  useEffect(() => {
    if (order) {
      dispatch(orderAsyncActions.fetchOrderDetail(plans));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(order)]);

  const normalizeData = useMemo(() => {
    return normalizePlanDetailsToEvent(orderDetail, order, coverImageList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverImageList, JSON.stringify(order), JSON.stringify(orderDetail)]);

  return {
    rawOrderDetail: orderDetail,
    orderDetail: normalizeData,
    fetchOrderDetailInProgress,
    fetchOrderDetailError,
  };
};
