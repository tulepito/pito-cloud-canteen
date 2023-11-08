/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import PopupModal from '@components/PopupModal/PopupModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import {
  NotificationActions,
  NotificationThunks,
} from '@redux/slices/notification.slice';
import { partnerPaths } from '@src/paths';
import { Listing, Transaction } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { ENotificationType, EOrderType } from '@src/utils/enums';
import {
  CHANGE_STRUCTURE_TX_PROCESS_VERSION,
  ETransition,
} from '@src/utils/transaction';
import type { TListing, TObject } from '@src/utils/types';

import MobileSubOrderSummary from './components/MobileSubOrderSummary/MobileSubOrderSummary';
import SubOrderCart from './components/SubOrderCart';
import SubOrderDetail from './components/SubOrderDetail';
import SubOrderInfo from './components/SubOrderInfo';
import SubOrderNote from './components/SubOrderNote';
import SubOrderSummary from './components/SubOrderSummary';
import SubOrderTitle from './components/SubOrderTitle';
import { PartnerSubOrderDetailThunks } from './PartnerSubOrderDetail.slice';

import css from './PartnerSubOrderDetailPage.module.scss';

type TPartnerSubOrderDetailPageProps = {};
export enum EPartnerSubOrderDetailPageViewMode {
  summary = 'summary',
  detail = 'detail',
}

const PartnerSubOrderDetailPage: React.FC<
  TPartnerSubOrderDetailPageProps
> = () => {
  const router = useRouter();
  const intl = useIntl();
  const notifications = useAppSelector(
    (state) => state.Notification.notifications,
  );
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);
  const transaction = useAppSelector(
    (state) => state.PartnerSubOrderDetail.transaction,
  );
  const transitInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.transitInProgress,
  );
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );
  const queryTransactionInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.queryTransactionInProgress,
  );
  const isFetchingOrderDetails = useAppSelector(
    (state) => state.OrderManagement.fetchOrderInProgress,
  );

  const updateOrderModalContainer = useBoolean();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState(
    EPartnerSubOrderDetailPageViewMode.summary,
  );
  const { isMobileLayout } = useViewport();

  const {
    isReady,
    query: { subOrderId = '' },
  } = router;
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [orderId, date] = (subOrderId as string)?.split('_');
  const { plan } = order;
  const orderGetter = Listing(order as TListing);
  const planGetter = Listing(plan as TListing);
  const { orderType = EOrderType.group } = orderGetter.getMetadata();
  const { orderDetail = {} } = planGetter.getMetadata();
  const isGroupOrder = orderType === EOrderType.group;

  // TODO: handle transaction data
  const txGetter = Transaction(transaction!);
  const {
    lastTransition,
    processVersion = CHANGE_STRUCTURE_TX_PROCESS_VERSION - 1,
  } = txGetter.getAttributes();

  const isNewStructureTxVersion =
    processVersion >= CHANGE_STRUCTURE_TX_PROCESS_VERSION;

  const shouldShowActionWrapper =
    !fetchOrderInProgress &&
    !queryTransactionInProgress &&
    isNewStructureTxVersion &&
    lastTransition === ETransition.INITIATE_TRANSACTION;
  //

  const isSummaryViewMode =
    viewMode === EPartnerSubOrderDetailPageViewMode.summary;
  const newUpdatedOrderNotificationIds = notifications.reduce(
    (
      ids,
      {
        id,
        notificationType,
        seen,
        orderId: notiOrderId,
        subOrderDate: notiDate,
      },
    ) =>
      seen !== true &&
      notificationType === ENotificationType.SUB_ORDER_UPDATED &&
      notiDate?.toString() === date &&
      notiOrderId?.toString() === orderId
        ? ids.concat(id)
        : ids,
    [],
  );
  const newUpdatedOrderNotification = notifications.find(
    ({
      notificationType,
      seen,
      orderId: notiOrderId,
      subOrderDate: notiDate,
    }) =>
      seen !== true &&
      notificationType === ENotificationType.SUB_ORDER_UPDATED &&
      notiDate?.toString() === date &&
      notiOrderId?.toString() === orderId,
  );
  const [currentOrderData] = groupFoodOrderByDate({
    isGroupOrder,
    orderDetail,
    date: date ? Number(date) : undefined,
  }) || [{}];
  const { foodDataList: currentFoodList = [] } = currentOrderData || {};
  const [oldOrderDataMaybe] = !isEmpty(newUpdatedOrderNotification)
    ? groupFoodOrderByDate({
        isGroupOrder,
        orderDetail: {
          [date]: newUpdatedOrderNotification?.oldOrderDetail || {},
        },
        date: date ? Number(date) : undefined,
      })
    : [{}];
  const { foodDataList: oldFoodList = [] } = oldOrderDataMaybe || {};
  const foodList: TObject[] = uniqBy(
    currentFoodList.concat(oldFoodList),
    'foodId',
  );

  const hasAnyChanges = foodList.some(({ foodId }: TObject) => {
    const { frequency: oldFrequency = 0 } =
      oldFoodList.find((item: TObject) => item.foodId === foodId) || {};
    const { frequency: crrFrequency = 0 } =
      currentFoodList.find((item: TObject) => item.foodId === foodId) || {};

    return oldFrequency !== crrFrequency;
  });

  const handleChangeViewMode =
    (_viewMode: EPartnerSubOrderDetailPageViewMode) => () => {
      setViewMode(_viewMode);
    };

  const handleCloseModal = () => {
    dispatch(
      NotificationThunks.markNotificationsSeen(newUpdatedOrderNotificationIds),
    );
    dispatch(
      NotificationActions.markNotificationsSeen(newUpdatedOrderNotificationIds),
    );
    updateOrderModalContainer.setFalse();
  };

  const handleGoBack = () => {
    router.push(partnerPaths.ManageOrders);
  };

  const handleTransit = (newTransition: ETransition) => () => {
    dispatch(
      PartnerSubOrderDetailThunks.transitSubOrderTransaction({
        orderId,
        subOrderDate: date,
        transactionId: txGetter.getId(),
        newTransition,
      }),
    );
  };

  const actionBtns = (
    <>
      <Button
        variant="secondary"
        disabled={transitInProgress}
        onClick={handleTransit(ETransition.PARTNER_REJECT_SUB_ORDER)}>
        Từ chối
      </Button>
      <Button
        disabled={transitInProgress}
        onClick={handleTransit(ETransition.PARTNER_CONFIRM_SUB_ORDER)}>
        Xác nhận
      </Button>
    </>
  );

  useEffect(() => {
    if (subOrderId && date && isReady) {
      dispatch(PartnerSubOrderDetailThunks.loadData({ orderId, date }));
    }
  }, [isReady, subOrderId, date]);

  useEffect(() => {
    if (!fetchOrderInProgress && newUpdatedOrderNotification && hasAnyChanges) {
      updateOrderModalContainer.setTrue();
    }

    if (!hasAnyChanges) {
      dispatch(
        NotificationThunks.markNotificationsSeen(
          newUpdatedOrderNotificationIds,
        ),
      );
    }
  }, [
    fetchOrderInProgress,
    hasAnyChanges,
    JSON.stringify(newUpdatedOrderNotification),
  ]);

  return (
    <div className={css.root}>
      <RenderWhen condition={!isMobileLayout || isSummaryViewMode}>
        <>
          <div className={css.goBackContainer} onClick={handleGoBack}>
            <IconArrow direction="left" />
          </div>
          <SubOrderTitle />
        </>
      </RenderWhen>
      <RenderWhen condition={isSummaryViewMode}>
        <div className={css.container}>
          <div className={css.leftPart}>
            <SubOrderInfo inProgress={fetchOrderInProgress} />
            <div className={css.mobileSubOrderCartWrapper}>
              <SubOrderCart
                title="Thực đơn phục vụ"
                inProgress={fetchOrderInProgress || isFetchingOrderDetails}
              />
            </div>
            <div className={css.mobileSubOrderSummaryWrapper}>
              <MobileSubOrderSummary onChangeViewMode={handleChangeViewMode} />
            </div>
            <div className={css.subOrderSummaryWrapper}>
              <SubOrderSummary onChangeViewMode={handleChangeViewMode} />
            </div>
            <SubOrderNote />
          </div>
          <div className={css.rightPart}>
            <SubOrderCart
              inProgress={fetchOrderInProgress || isFetchingOrderDetails}
            />
          </div>
          <RenderWhen condition={shouldShowActionWrapper}>
            <div className={css.subOrderSummaryActionWrapper}>{actionBtns}</div>
            <MobileBottomContainer
              className={css.subOrderSummaryMobileActionWrapper}>
              {actionBtns}
            </MobileBottomContainer>
          </RenderWhen>
        </div>

        <RenderWhen condition={!isEmpty(newUpdatedOrderNotification)}>
          <PopupModal
            isOpen={!fetchOrderInProgress && updateOrderModalContainer.value}
            handleClose={handleCloseModal}
            className={css.updatedOrderModal}
            headerClassName={css.updatedOrderModalHeader}
            containerClassName={css.updatedOrderModalContainer}>
            <div>
              <div className={css.title}>
                {intl.formatMessage(
                  {
                    id: 'PartnerSubOrderDetailPage.updateOrderModal.title',
                  },
                  {
                    updatedAt: formatTimestamp(
                      (newUpdatedOrderNotification?.createdAt?.seconds || 0) *
                        1000,
                      'HH:mm, dd/MM/yyyy',
                    ),
                  },
                )}
              </div>
              <div className={css.changes}>
                <div className={css.headRow}>
                  <div>
                    {intl.formatMessage({
                      id: 'PartnerSubOrderDetailPage.updateOrderModal.tableHeads.type',
                    })}
                  </div>
                  <div>
                    {intl.formatMessage({
                      id: 'PartnerSubOrderDetailPage.updateOrderModal.tableHeads.oldValues',
                    })}
                  </div>
                  <div>
                    {intl.formatMessage({
                      id: 'PartnerSubOrderDetailPage.updateOrderModal.tableHeads.newValues',
                    })}
                  </div>
                </div>
                <>
                  {foodList.map(({ foodId, foodName }: TObject) => {
                    const { frequency: oldFrequency = 0 } =
                      oldFoodList.find(
                        (item: TObject) => item.foodId === foodId,
                      ) || {};
                    const { frequency: crrFrequency = 0 } =
                      currentFoodList.find(
                        (item: TObject) => item.foodId === foodId,
                      ) || {};

                    return oldFrequency === crrFrequency ? null : (
                      <div key={foodId} className={css.row}>
                        <div title={foodName}>{foodName}</div>
                        <div>{oldFrequency}</div>
                        <div>{crrFrequency}</div>
                      </div>
                    );
                  })}
                </>
              </div>

              <div className={css.action}>
                <Button
                  onClick={handleCloseModal}
                  className={css.viewDetailsBtn}>
                  <div>
                    {intl.formatMessage({
                      id: 'PartnerSubOrderDetailPage.updateOrderModal.viewDetails',
                    })}
                  </div>
                </Button>
              </div>
            </div>
          </PopupModal>
        </RenderWhen>

        <RenderWhen.False>
          <SubOrderDetail onChangeViewMode={handleChangeViewMode} />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default PartnerSubOrderDetailPage;
