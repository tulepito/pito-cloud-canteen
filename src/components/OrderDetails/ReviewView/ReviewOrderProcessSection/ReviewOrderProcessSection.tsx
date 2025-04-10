/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import Link from 'next/link';

import Button from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ActivityItem from '@components/TimeLine/ActivityItem';
import VerticalTimeLine from '@components/TimeLine/VerticalTimeLine';
import { useAppSelector } from '@hooks/reduxHooks';
import { enGeneralPaths } from '@src/paths';
import { ETransition } from '@src/utils/transaction';
import { Listing } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@utils/enums';
import type { TListing, TObject, TOrderStateHistoryItem } from '@utils/types';

import css from './ReviewOrderProcessSection.module.scss';

const findCurrentActiveIndex = (orderStateHistory = []) => {
  if (isEmpty(orderStateHistory)) {
    return 1;
  }
  const latestHistory = orderStateHistory[
    orderStateHistory.length - 1
  ] as TOrderStateHistoryItem;

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

const prepareItemData = (orderStateHistory: TOrderStateHistoryItem[] = []) => {
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
  const planData = useAppSelector((state) => state.OrderManagement.planData);

  const { orderStateHistory, orderState, companyId } = Listing(
    orderData as TListing,
  ).getMetadata();
  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();

  const orderIsInProgress = orderState === EOrderStates.inProgress;
  const shouldShowUpdateMemberOrderBtn = orderIsInProgress;
  const orderId = Listing(orderData as TListing).getId();

  const totalDays = Object.values(orderDetail as TObject).filter(
    ({ transactionId }: TObject) => {
      return !isEmpty(transactionId);
    },
  ).length;
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
    setTotalCompletedDates(
      Object.values(orderDetail as TObject).filter(
        ({ lastTransition }: TObject) =>
          [
            ETransition.COMPLETE_DELIVERY,
            ETransition.REVIEW_RESTAURANT,
            ETransition.REVIEW_RESTAURANT_AFTER_EXPIRE_TIME,
          ].includes(lastTransition),
      ).length,
    );
  }, [JSON.stringify(orderDetail)]);

  return (
    <>
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
        <RenderWhen condition={shouldShowUpdateMemberOrderBtn}>
          <div className={css.separator}></div>
          <Link
            className={css.pickingLink}
            href={`/company/orders/${orderId}/picking`}>
            Quản lý chọn món
          </Link>
        </RenderWhen>
      </div>

      {(orderState === EOrderStates.inProgress ||
        orderState === EOrderStates.pendingPayment ||
        orderState === EOrderStates.completed ||
        orderState === EOrderStates.reviewed) && (
        <div className="mx-auto w-full flex justify-center">
          <Link
            className="w-full"
            href={`${enGeneralPaths.company['[companyId]'].ratings.index(
              companyId,
            )}?orderCode=${orderData?.attributes?.title}`}>
            <Button
              variant="secondary"
              type="button"
              className="w-full hover:stroke-[#fdb212] !border-[#fdb212]"
              style={{
                color: '#fdb212',
              }}>
              <div
                className="flex items-center gap-2"
                style={{
                  color: '#fdb212',
                }}>
                <svg
                  stroke="currentColor"
                  width="32px"
                  height="32px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    {' '}
                    <path
                      d="M8.32181 14.4933C7.3798 15.9862 6.90879 16.7327 7.22969 17.3433C7.55059 17.9538 8.45088 18.0241 10.2514 18.1647L10.7173 18.201C11.2289 18.241 11.4848 18.261 11.7084 18.3785C11.9321 18.4961 12.0983 18.6979 12.4306 19.1015L12.7331 19.469C13.9026 20.8895 14.4873 21.5997 15.1543 21.5084C15.8213 21.417 16.1289 20.5846 16.7439 18.9198L16.9031 18.4891C17.0778 18.0161 17.1652 17.7795 17.3369 17.6078C17.5086 17.4362 17.7451 17.3488 18.2182 17.174L18.6489 17.0149C20.3137 16.3998 21.1461 16.0923 21.2374 15.4253C21.3288 14.7583 20.6185 14.1735 19.1981 13.0041M17.8938 10.5224C17.7532 8.72179 17.6829 7.8215 17.0723 7.5006C16.4618 7.1797 15.7153 7.65071 14.2224 8.59272L13.8361 8.83643C13.4119 9.10412 13.1998 9.23797 12.9554 9.27143C12.7111 9.30488 12.4622 9.23416 11.9644 9.09271L11.5113 8.96394C9.75959 8.46619 8.88375 8.21732 8.41508 8.68599C7.94641 9.15467 8.19528 10.0305 8.69303 11.7822"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"></path>{' '}
                    <path
                      d="M13.5 6.5L13 6M9.5 2.5L11.5 4.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"></path>{' '}
                    <path
                      d="M6.5 6.5L4 4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"></path>{' '}
                    <path
                      d="M6 12L4.5 10.5M2 8L2.5 8.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"></path>{' '}
                  </g>
                </svg>
                <span>Thành viên đánh giá</span>
              </div>
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default ReviewOrderProcessSection;
