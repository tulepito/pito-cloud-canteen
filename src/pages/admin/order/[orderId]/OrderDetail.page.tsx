/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import compact from 'lodash/compact';
import { useRouter } from 'next/router';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import { EOrderDetailTabs, EOrderStates } from '@src/utils/enums';

import { AdminManageOrderThunks } from '../AdminManageOrder.slice';

import OrderDetailTab from './tabs/OrderDetailTab/OrderDetailTab';
import OrderPaymentStatusTab from './tabs/OrderPaymentStatusTab/OrderPaymentStatusTab';
import OrderQuotationTab from './tabs/OrderQuotationTab/OrderQuotationTab';

import css from './OrderDetail.module.scss';

const OrderDetailPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orderId, tab, subOrderDate } = router.query;
  const [defaultActiveKey, setDefaultActiveKey] = useState<number>(1);

  const order = useAppSelector(
    (state) => state.AdminManageOrder.order,
    shallowEqual,
  );
  const orderDetail = useAppSelector((state) => {
    return state.AdminManageOrder.orderDetail;
  }, shallowEqual);
  const company = useAppSelector(
    (state) => state.OrderManagement.companyData,
    shallowEqual,
  );
  const booker = useAppSelector(
    (state) => state.OrderManagement.bookerData,
    shallowEqual,
  );
  const fetchOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.fetchOrderInProgress,
  );
  const updateOrderStaffNameInProgress = useAppSelector(
    (state) => state.AdminManageOrder.updateOrderStaffNameInProgress,
  );
  const updateOrderStateInProgress = useAppSelector(
    (state) => state.AdminManageOrder.updateOrderStateInProgress,
  );
  const quotations = useAppSelector(
    (state) => state.AdminManageOrder.quotations,
    shallowEqual,
  );
  const quotationsPagination = useAppSelector(
    (state) => state.AdminManageOrder.quotationsPagination,
    shallowEqual,
  );

  const { orderState } = Listing(order).getMetadata();
  const isShowOrderPaymentStatusTab = [
    EOrderStates.inProgress,
    EOrderStates.completed,
    EOrderStates.pendingPayment,
    EOrderStates.reviewed,
  ].includes(orderState);

  useEffect(() => {
    if (orderId) {
      dispatch(
        orderManagementThunks.loadData({
          orderId: orderId as string,
          isAdminFlow: true,
        }),
      );
    }
  }, [orderId]);

  const updateStaffName = useCallback(
    (staffName: string) => {
      dispatch(
        AdminManageOrderThunks.updateStaffName({
          orderId: orderId as string,
          staffName,
        }),
      );
    },
    [orderId],
  );

  const handleUpdateOrderState = async (newOrderState: EOrderStates) => {
    if (typeof orderId !== 'string') return;

    await dispatch(
      AdminManageOrderThunks.updateOrderState({
        orderId,
        orderState: newOrderState,
        options: {
          triggerRemindingPickingEmail: true,
        },
      }),
    );

    dispatch(
      orderManagementThunks.loadData({
        orderId: orderId as string,
        isAdminFlow: true,
      }),
    );
  };

  const handleSaveOrderNote = (orderNote: string) => {
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
        updateOrderState: handleUpdateOrderState,
        updateOrderStateInProgress,
        onSaveOrderNote: handleSaveOrderNote,
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
        updateOrderState: handleUpdateOrderState,
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
        updateOrderState: handleUpdateOrderState,
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
