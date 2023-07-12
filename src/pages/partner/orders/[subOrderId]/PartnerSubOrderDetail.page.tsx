/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  NotificationActions,
  NotificationThunks,
} from '@redux/slices/notification.slice';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { ENotificationType, EOrderType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

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
  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );
  const updateOrderModalContainer = useBoolean();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState(
    EPartnerSubOrderDetailPageViewMode.summary,
  );

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
  const foodList: TObject[] = Array.from(
    new Set(currentFoodList.concat(oldFoodList)),
  );

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

  const handleClickViewDetails = () => {
    handleChangeViewMode(EPartnerSubOrderDetailPageViewMode.detail);
    handleCloseModal();
  };

  useEffect(() => {
    if (subOrderId && isReady) {
      dispatch(PartnerSubOrderDetailThunks.loadData({ orderId, date }));
      dispatch(orderManagementThunks.loadData(orderId));
    }
  }, [isReady, subOrderId]);

  useEffect(() => {
    if (!fetchOrderInProgress && newUpdatedOrderNotification) {
      updateOrderModalContainer.setTrue();
    }
  }, [fetchOrderInProgress, JSON.stringify(newUpdatedOrderNotification)]);

  useEffect(() => {
    return () => {
      dispatch(
        NotificationThunks.markNotificationsSeen(
          newUpdatedOrderNotificationIds,
        ),
      );
      dispatch(
        NotificationActions.markNotificationsSeen(
          newUpdatedOrderNotificationIds,
        ),
      );
    };
  }, []);

  return (
    <div className={css.root}>
      <SubOrderTitle />
      <RenderWhen condition={isSummaryViewMode}>
        <div className={css.container}>
          <div className={css.leftPart}>
            <SubOrderInfo />
            <SubOrderSummary onChangeViewMode={handleChangeViewMode} />
            <SubOrderNote />
          </div>
          <div className={css.rightPart}>
            <SubOrderCart />
          </div>
        </div>

        <RenderWhen condition={!isEmpty(newUpdatedOrderNotification)}>
          <Modal
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

                    return (
                      <div key={foodId} className={css.row}>
                        <div title={foodName}>{foodName}</div>
                        <div>{oldFrequency}</div>
                        <div>{crrFrequency}</div>
                      </div>
                    );
                  })}{' '}
                </>
              </div>

              <RenderWhen condition={isGroupOrder}>
                <div className={css.action}>
                  <Button
                    onClick={handleClickViewDetails}
                    className={css.viewDetailsBtn}>
                    <div>
                      {intl.formatMessage({
                        id: 'PartnerSubOrderDetailPage.updateOrderModal.viewDetails',
                      })}
                    </div>
                  </Button>
                </div>
              </RenderWhen>
            </div>
          </Modal>
        </RenderWhen>

        <RenderWhen.False>
          <SubOrderDetail onChangeViewMode={handleChangeViewMode} />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default PartnerSubOrderDetailPage;
