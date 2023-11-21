import React, { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import ManageLineItemsSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageLineItemsSection';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
// eslint-disable-next-line import/no-cycle
import NavigateButtons from '@pages/admin/order/components/NavigateButtons/NavigateButtons';
import { checkMinMaxQuantityInPickingState } from '@pages/company/orders/[orderId]/picking/OrderDetail.page';
import {
  setCanNotGoAfterFoodQuantity,
  setCanNotGoAfterOderDetail,
} from '@redux/slices/Order.slice';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';

function checkMinMaxQuantityInPickingStateForAdmin(
  isNormalOrder: boolean,
  orderDetail: TPlan['orderDetail'] = {},
) {
  return checkMinMaxQuantityInPickingState(isNormalOrder, true, orderDetail);
}

function FoodQuantitySection({
  goBack,
  nextTab,
}: React.PropsWithChildren<{
  goBack: () => void;
  nextTab: () => void;
}>): React.ReactElement<any, any> | null {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orderId } = router.query;
  const [currentViewDate, setCurrentViewDate] = useState<number>(
    new Date().getTime(),
  );
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const { orderType } = Listing(order).getMetadata();
  const isNormalOrder = orderType === EOrderType.normal;

  const { minQuantity = 1 } = orderDetail?.[currentViewDate]?.restaurant || {};

  const { planValidations } = checkMinMaxQuantityInPickingStateForAdmin(
    isNormalOrder,
    orderDetail,
  );

  const { planReachMaxRestaurantQuantity, planReachMinRestaurantQuantity } =
    planValidations[currentViewDate as keyof typeof planValidations] || {};

  useEffect(() => {
    if (orderId) {
      dispatch(
        orderManagementThunks.loadData({
          orderId: orderId as string,
          isAdminFlow: true,
        }),
      );
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    dispatch(setCanNotGoAfterOderDetail(false));
    dispatch(setCanNotGoAfterFoodQuantity(true));
  }, [dispatch]);

  const handleSetCurrentViewDate = (date: number) => {
    setCurrentViewDate(date);
  };

  const onNextClick = () => {
    dispatch(setCanNotGoAfterFoodQuantity(true));
    nextTab();
  };

  return (
    <div>
      <ManageLineItemsSection
        ableToUpdateOrder
        shouldShowOverflowError={planReachMaxRestaurantQuantity}
        shouldShowUnderError={planReachMinRestaurantQuantity}
        setCurrentViewDate={handleSetCurrentViewDate}
        currentViewDate={currentViewDate}
        minQuantity={minQuantity}
        isAdminFlow
      />
      <div>
        <NavigateButtons goBack={goBack} onNextClick={onNextClick} />
      </div>
    </div>
  );
}

export default FoodQuantitySection;
