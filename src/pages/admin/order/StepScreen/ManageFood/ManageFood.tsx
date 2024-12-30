/* eslint-disable import/no-cycle */
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import ManageLineItemsSection from '@components/OrderDetails/EditView/ManageOrderDetailSection/ManageLineItemsSection';
import { checkMinMaxQuantityInPickingState } from '@helpers/order/orderPickingHelper';
import { checkIsOrderHasInProgressState } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import OrderQuantityErrorSection from '@pages/company/orders/[orderId]/picking/OrderQuantityErrorSection';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import { EOrderStates, EOrderType } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';

import type { EFlowType } from '../../components/NavigateButtons/NavigateButtons';
import NavigateButtons from '../../components/NavigateButtons/NavigateButtons';

import css from './ManageFood.module.scss';

type TManageFoodProps = {
  goBack: () => void;
  nextTab: () => void;
  nextToReviewTab: () => void;
  flowType?: EFlowType;
};

const ManageFood: React.FC<TManageFoodProps> = (props) => {
  const { goBack, nextTab, nextToReviewTab, flowType } = props;
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isDraftEditing] = useState<boolean>(false);
  const {
    query: { timestamp },
    isReady: isRouterReady,
  } = router;
  const [currentViewDate, setCurrentViewDate] = useState<number>(
    Number(timestamp),
  );

  const {
    draftOrderDetail,
    orderValidationsInProgressState,
    fetchOrderInProgress,
  } = useAppSelector((state) => state.OrderManagement);
  const order = useAppSelector((state) => state.Order.order);
  const orderDetail = useAppSelector((state) => state.Order.orderDetail);
  const draftEditOrderData = useAppSelector(
    (state) => state.Order.draftEditOrderData,
  );

  const { orderDetail: draftOrderDetailFromOrder = {} } = draftEditOrderData;

  const unChangedRestaurantDayList = Object.keys(orderDetail || {}).filter(
    (date) => {
      const oldRestaurantId = orderDetail[date].restaurant.id;
      const newRestaurantId = draftOrderDetailFromOrder[date].restaurant.id;

      return oldRestaurantId === newRestaurantId;
    },
  );

  const { planValidationsInProgressState } =
    orderValidationsInProgressState || {};

  const planReachMaxRestaurantQuantityInProgressState =
    planValidationsInProgressState?.[currentViewDate]
      ?.planReachMaxRestaurantQuantity;

  const planReachMinRestaurantQuantityInProgressState =
    planValidationsInProgressState?.[currentViewDate]
      ?.planReachMinRestaurantQuantity;

  const orderGetter = Listing(order);
  const orderId = orderGetter.getId();
  const { title: orderTitle } = orderGetter.getAttributes();
  const {
    orderState,
    orderType = EOrderType.group,
    orderStateHistory = [],
  } = orderGetter.getMetadata();

  const isOrderHasInProgressState =
    checkIsOrderHasInProgressState(orderStateHistory);
  const isOrderInProgressState = orderState === EOrderStates.inProgress;

  const currentDraftOrderDetail =
    isOrderHasInProgressState && isOrderInProgressState
      ? draftOrderDetailFromOrder
      : draftOrderDetail;

  const isNormalOrder = orderType === EOrderType.normal;
  const isPickingState = orderState === EOrderStates.picking;

  const { lastTransition = ETransition.INITIATE_TRANSACTION } =
    currentDraftOrderDetail?.[currentViewDate] || {};
  const ableToUpdateOrder =
    !fetchOrderInProgress &&
    isRouterReady &&
    ((lastTransition === ETransition.INITIATE_TRANSACTION && isDraftEditing) ||
      isPickingState ||
      isOrderHasInProgressState);

  const { planValidations } = checkMinMaxQuantityInPickingState(
    isNormalOrder,
    isPickingState,
    currentDraftOrderDetail,
  );

  const {
    planReachMaxRestaurantQuantity:
      planReachMaxRestaurantQuantityInPickingState,
    planReachMinRestaurantQuantity:
      planReachMinRestaurantQuantityInPickingState,
  } = planValidations[currentViewDate as keyof typeof planValidations] || {};

  const { minQuantity = 1, maxQuantity = 100 } =
    currentDraftOrderDetail?.[currentViewDate]?.restaurant || {};

  useEffect(() => {
    if (orderId) {
      dispatch(
        orderManagementThunks.loadData({
          orderId: orderId as string,
          isAdminFlow: true,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const errorSection = (
    <OrderQuantityErrorSection
      planReachMaxRestaurantQuantity={
        planReachMaxRestaurantQuantityInProgressState ||
        planReachMaxRestaurantQuantityInPickingState
      }
      planReachMinRestaurantQuantity={
        planReachMinRestaurantQuantityInProgressState ||
        planReachMinRestaurantQuantityInPickingState
      }
      maxQuantity={maxQuantity}
      minQuantity={minQuantity}
    />
  );

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <div>
          <div className={css.row}>
            {orderTitle ? (
              <span className={css.orderTitle}>{`#${orderTitle}`}</span>
            ) : (
              <span className={css.orderTitle}>
                {intl.formatMessage({
                  id: 'SetupOrderDetail.orderId.draft',
                })}
              </span>
            )}

            <Badge label={`Đơn hàng tuần`} type={EBadgeType.info} />
          </div>
        </div>
      </div>
      <ManageLineItemsSection
        isDraftEditing
        ableToUpdateOrder={ableToUpdateOrder}
        errorSection={errorSection}
        setCurrentViewDate={setCurrentViewDate}
        currentViewDate={currentViewDate}
        isAdminFlow
        unChangedRestaurantDayList={unChangedRestaurantDayList}
      />

      <NavigateButtons
        flowType={flowType}
        goBack={goBack}
        onNextClick={nextTab}
        onCompleteClick={nextToReviewTab}
      />
    </div>
  );
};

export default ManageFood;
