import ActivityItem from '@components/TimeLine/ActivityItem';
import VerticalTimeLine from '@components/TimeLine/VerticalTimeLine';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@utils/enums';
import type { TListing, TOrderStateHistory } from '@utils/types';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

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
    switch (state) {
      case EOrderDraftStates.pendingApproval:
        parsedCreateOrderTime =
          DateTime.fromMillis(updatedAt).toFormat('HH:mm - dd/MM/yyyy');
        break;
      case EOrderStates.picking:
        parsedStartPickingTime =
          DateTime.fromMillis(updatedAt).toFormat('HH:mm - dd/MM/yyyy');
        break;
      case EOrderStates.inProgress:
        parsedStartOrderTime =
          DateTime.fromMillis(updatedAt).toFormat('HH:mm - dd/MM/yyyy');
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
  const [totalCompletedDates] = useState(0);

  const { orderData } = useAppSelector((state) => state.OrderManagement);

  const {
    orderStateHistory,
    startDate = 0,
    endDate = 0,
  } = Listing(orderData as TListing).getMetadata();

  const totalDays =
    DateTime.fromMillis(endDate).diff(DateTime.fromMillis(startDate), 'days')
      .days + 1;

  const activeIndex = findCurrentActiveIndex(orderStateHistory);

  const sectionTitle = intl.formatMessage({
    id: 'ReviewOrderProcessSection.title',
  });

  const initItems = useMemo(
    () => prepareItemData(orderStateHistory),
    [orderStateHistory],
  );

  const items = [
    ...initItems,
    {
      label: 'Đang triển khai',
      description: `(${totalCompletedDates}/${totalDays} ngày hoàn thành)`,
    },
    { label: 'Đã hoàn thành' },
  ];

  return (
    <div className={css.root}>
      <div className={css.sectionTitle}>{sectionTitle}</div>
      <div className={css.activityContainer}>
        <VerticalTimeLine
          itemComponent={ActivityItem}
          items={items}
          lastActiveItem={activeIndex}
        />
      </div>
    </div>
  );
};

export default ReviewOrderProcessSection;
