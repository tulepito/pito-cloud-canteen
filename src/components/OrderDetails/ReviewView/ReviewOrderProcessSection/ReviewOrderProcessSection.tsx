/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import Link from 'next/link';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import ActivityItem from '@components/TimeLine/ActivityItem';
import VerticalTimeLine from '@components/TimeLine/VerticalTimeLine';
import { countCompletedTransactions } from '@helpers/transactionHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@utils/enums';
import type { TListing, TOrderStateHistory } from '@utils/types';

import css from './ReviewOrderProcessSection.module.scss';

const findCurrentActiveIndex = (orderStateHistory = []) => {
  if (isEmpty(orderStateHistory)) {
    return 1;
  }
  const latestHistory = orderStateHistory[
    orderStateHistory.length - 1
  ] as TOrderStateHistory;

  switch (latestHistory.state) {
    case EOrderDraftStates.draft:
      return 0;
    case EOrderDraftStates.pendingApproval:
    case EBookerOrderDraftStates.bookerDraft:
      return 1;
    case EOrderStates.picking:
      return 2;
    case EOrderStates.inProgress:
      return 4;
    default:
      return 5;
  }
};

const prepareItemData = (orderStateHistory: TOrderStateHistory[] = []) => {
  let parsedCreateOrderTime = '';
  let parsedStartPickingTime = '';
  let parsedStartOrderTime = '';

  orderStateHistory.forEach(({ state, updatedAt }) => {
    const parsedNumberUpdatedAt = Number(updatedAt);
    const formattedTime = DateTime.fromMillis(parsedNumberUpdatedAt).toFormat(
      'HH:mm - dd/MM/yyyy',
    );

    switch (state) {
      case EOrderDraftStates.pendingApproval:
      case EBookerOrderDraftStates.bookerDraft:
        parsedCreateOrderTime = formattedTime;
        break;
      case EOrderStates.picking:
        parsedStartPickingTime = formattedTime;
        break;
      case EOrderStates.inProgress:
        parsedStartOrderTime = formattedTime;
        break;
      default:
        break;
    }
  });

  return [
    { label: 'Mới tạo', description: parsedCreateOrderTime },
    { label: 'Chọn món', description: parsedStartPickingTime },
    { label: 'Xác nhận đơn', description: parsedStartOrderTime },
  ];
};

type TReviewOrderProcessSectionProps = {};

const ReviewOrderProcessSection: React.FC<
  TReviewOrderProcessSectionProps
> = () => {
  const intl = useIntl();
  const [totalCompletedDates, setTotalCompletedDates] = useState(0);

  const orderData = useAppSelector((state) => state.OrderManagement.orderData);
  const transactionDataMap = useAppSelector(
    (state) => state.OrderManagement.transactionDataMap,
  );
  const transactionDataList = Object.values(transactionDataMap);
  const { orderStateHistory, orderState } = Listing(
    orderData as TListing,
  ).getMetadata();
  const orderIsInProgress = orderState === EOrderStates.inProgress;
  const orderId = Listing(orderData as TListing).getId();

  const totalDays = transactionDataList.length;
  const activeIndex = findCurrentActiveIndex(orderStateHistory);

  const sectionTitle = intl.formatMessage({
    id: 'ReviewOrderProcessSection.title',
  });

  const items = useMemo(
    () =>
      prepareItemData(orderStateHistory).concat([
        {
          label: 'Đang triển khai',
          description: `(${totalCompletedDates}/${totalDays} ngày hoàn thành)`,
        },
        { label: 'Đã hoàn thành', description: '' },
      ]),
    [JSON.stringify(orderStateHistory), totalCompletedDates, totalDays],
  );

  const isItemsValid =
    items[0].description !== '' && items[1].description !== '';

  useEffect(() => {
    setTotalCompletedDates(countCompletedTransactions(transactionDataList));
  }, [totalDays]);

  return (
    <div className={css.root}>
      <div className={css.sectionTitle}>{sectionTitle}</div>
      <div className={css.activityContainer}>
        <RenderWhen condition={isItemsValid}>
          <VerticalTimeLine
            itemComponent={ActivityItem}
            items={items}
            lastActiveItem={activeIndex}
          />
          <RenderWhen.False>
            <div className={css.skeletonContainer}>
              <Skeleton className={css.skeletonCol} />
              <Skeleton className={css.skeletonRow} />
              <Skeleton className={css.skeletonRow} />
              <Skeleton className={css.skeletonRow} />
              <Skeleton className={css.skeletonRow} />
              <Skeleton className={css.skeletonRow} />
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <RenderWhen condition={orderIsInProgress}>
        <div className={css.separator}></div>
        <Link
          className={css.pickingLink}
          href={`/company/orders/${orderId}/picking`}>
          Quản lý chọn món
        </Link>
      </RenderWhen>
    </div>
  );
};

export default ReviewOrderProcessSection;
