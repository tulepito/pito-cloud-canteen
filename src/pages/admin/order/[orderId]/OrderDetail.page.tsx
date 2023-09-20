/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import compact from 'lodash/compact';
import { useRouter } from 'next/router';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import { EOrderDetailTabs, EOrderStates } from '@src/utils/enums';

import OrderDetailTab from './tabs/OrderDetailTab/OrderDetailTab';
import OrderPaymentStatusTab from './tabs/OrderPaymentStatusTab/OrderPaymentStatusTab';
import OrderQuotationTab from './tabs/OrderQuotationTab/OrderQuotationTab';
import { OrderDetailThunks } from './OrderDetail.slice';

import css from './OrderDetail.module.scss';

const OrderDetailPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orderId, tab, subOrderDate } = router.query;
  const [defaultActiveKey, setDefaultActiveKey] = useState<number>(1);

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

  const orderListing = Listing(order);
  const { orderState } = orderListing.getMetadata();
  const isShowOrderPaymentStatusTab = [
    EOrderStates.inProgress,
    EOrderStates.completed,
    EOrderStates.pendingPayment,
    EOrderStates.reviewed,
  ].includes(orderState);

  useEffect(() => {
    if (orderId) {
      dispatch(orderManagementThunks.loadData(orderId as string));
      dispatch(OrderDetailThunks.fetchOrder(orderId as string));
    }
  }, [orderId]);

  const updateStaffName = useCallback(
    (staffName: string) => {
      dispatch(
        OrderDetailThunks.updateStaffName({
          orderId: orderId as string,
          staffName,
        }),
      );
    },
    [orderId],
  );

  const updateOrderState = async (newOrderState: string) => {
    const { payload } = await dispatch(
      OrderDetailThunks.updateOrderState({
        orderId: orderId as string,
        orderState: newOrderState,
      }),
    );

    dispatch(OrderManagementsAction.updateOrderData(payload));
  };

  const onSaveOrderNote = (orderNote: string) => {
    return dispatch(
      orderManagementThunks.updateOrderGeneralInfo({
        orderNote,
      }),
    );
  };

  const tabItems = compact([
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
    isShowOrderPaymentStatusTab && {
      key: EOrderDetailTabs.PAYMENT_STATUS,
      label: 'Tình trạng thanh toán',
      childrenFn: (childProps: any) =>
        fetchOrderInProgress ? (
          <div className={css.loading}>Đang tải dữ liệu...</div>
        ) : (
          <OrderPaymentStatusTab {...childProps} />
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
        subOrderDate,
      },
    },
  ]);

  useEffect(() => {
    if (tab) {
      const tabIndexMaybe = tabItems.findIndex((item) => item.key === tab) + 1;

      setDefaultActiveKey(tabIndexMaybe === 0 ? 1 : tabIndexMaybe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, tabItems]);

  return (
    <div>
      <Tabs items={tabItems as any} defaultActiveKey={`${defaultActiveKey}`} />
    </div>
  );
};

export default OrderDetailPage;
