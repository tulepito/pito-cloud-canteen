import React, { useCallback, useEffect } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { EOrderDetailTabs } from '@src/utils/enums';

import OrderDetailTab from './tabs/OrderDetailTab/OrderDetailTab';
import OrderQuotationTab from './tabs/OrderQuotationTab/OrderQuotationTab';
import { OrderDetailThunks } from './OrderDetail.slice';

import css from './OrderDetail.module.scss';

const OrderDetailPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orderId } = router.query;

  const order = useAppSelector(
    (state) => state.OrderDetail.order,
    shallowEqual,
  );

  const orderDetail = useAppSelector(
    (state) => state.OrderDetail.orderDetail,
    shallowEqual,
  );
  const company = useAppSelector(
    (state) => state.OrderDetail.company,
    shallowEqual,
  );

  const booker = useAppSelector(
    (state) => state.OrderDetail.booker,
    shallowEqual,
  );

  const transactionDataMap = useAppSelector(
    (state) => state.OrderDetail.transactionDataMap,
  );

  const fetchOrderInProgress = useAppSelector(
    (state) => state.OrderDetail.fetchOrderInProgress,
  );

  const updateOrderStaffNameInProgress = useAppSelector(
    (state) => state.OrderDetail.updateOrderStaffNameInProgress,
  );

  const updateOrderStateInProgress = useAppSelector(
    (state) => state.OrderDetail.updateOrderStateInProgress,
  );

  const quotations = useAppSelector(
    (state) => state.OrderDetail.quotations,
    shallowEqual,
  );

  const quotationsPagination = useAppSelector(
    (state) => state.OrderDetail.quotationsPagination,
    shallowEqual,
  );

  useEffect(() => {
    if (orderId) {
      dispatch(orderManagementThunks.loadData(orderId as string));
      dispatch(OrderDetailThunks.fetchOrder(orderId as string));
    }
  }, [dispatch, orderId]);

  const updateStaffName = useCallback(
    (staffName: string) => {
      dispatch(
        OrderDetailThunks.updateStaffName({
          orderId: orderId as string,
          staffName,
        }),
      );
    },
    [dispatch, orderId],
  );

  const updateOrderState = (newOrderState: string) => {
    dispatch(
      OrderDetailThunks.updateOrderState({
        orderId: orderId as string,
        orderState: newOrderState,
      }),
    );
  };

  const onSaveOrderNote = (orderNote: string) => {
    return dispatch(
      orderManagementThunks.updateOrderGeneralInfo({
        orderNote,
      }),
    );
  };

  const tabItems = [
    {
      key: EOrderDetailTabs.ORDER_DETAIL,
      label: 'Chi tiết đơn hàng',
      childrenFn: (childProps: any) =>
        fetchOrderInProgress ? (
          <LoadingContainer loadingText="Đang tải dữ liệu..." />
        ) : (
          <OrderDetailTab {...childProps} />
        ),
      childrenProps: {
        orderDetail,
        order,
        company,
        booker,
        transactionDataMap,
        updateStaffName,
        updateOrderStaffNameInProgress,
        updateOrderState,
        updateOrderStateInProgress,
        onSaveOrderNote,
      },
    },
    {
      key: EOrderDetailTabs.QUOTATION,
      label: 'Báo giá',
      childrenFn: (childProps: any) =>
        fetchOrderInProgress ? (
          <div className={css.loading}>Đang tải dữ liệu...</div>
        ) : (
          <OrderQuotationTab {...childProps} />
        ),
      childrenProps: {
        orderDetail,
        order,
        company,
        booker,
        updateStaffName,
        updateOrderStaffNameInProgress,
        updateOrderState,
        updateOrderStateInProgress,
        quotations,
        quotationsPagination,
      },
    },
  ];

  return (
    <div>
      <Tabs items={tabItems as any} />
    </div>
  );
};

export default OrderDetailPage;
