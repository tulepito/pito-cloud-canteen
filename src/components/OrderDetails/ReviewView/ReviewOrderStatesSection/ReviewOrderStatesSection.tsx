import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import HorizontalTimeLine from '@components/TimeLine/HorizontalTimeLine';
import StateItem from '@components/TimeLine/StateItem';
import { formatTimestamp } from '@utils/dates';
import type { TObject, TTransaction } from '@utils/types';

import css from './ReviewOrderStatesSection.module.scss';

const prepareItemFromData = ({
  orderDetail,
  transactionMap,
}: {
  transactionMap: TObject<string | number, TTransaction>;
  orderDetail: TObject;
}) => {
  const items = Object.entries(orderDetail)
    .map(([date, orderData]) => {
      return {
        date: Number(date),
        orderData,
        transactionData: transactionMap[date],
      };
    })
    .sort((item, item2) => item.date - item2.date)
    .map(({ date, ...rest }) => {
      return {
        date: formatTimestamp(Number(date), 'dd/M/yyyy'),
        ...rest,
      };
    });

  return items;
};

type TReviewOrderStatesSectionProps = {
  data: {
    orderDetail: TObject;
    transactionMap?: TObject<string, TTransaction>;
    isCanceledOrder: boolean;
  };
  isAdminLayout?: boolean;
  className?: string;
};

const ReviewOrderStatesSection: React.FC<TReviewOrderStatesSectionProps> = ({
  data: { orderDetail = {}, isCanceledOrder, transactionMap = {} },
  isAdminLayout = false,
  className,
}) => {
  const items = useMemo(
    () =>
      prepareItemFromData({
        orderDetail,
        transactionMap,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(orderDetail), JSON.stringify(transactionMap)],
  );

  const classes = classNames(css.root, className);

  return (
    <RenderWhen condition={!isCanceledOrder}>
      <RenderWhen condition={!isEmpty(items)}>
        <div className={classes}>
          <HorizontalTimeLine
            items={items}
            itemComponent={StateItem}
            haveNavigators
            isAdminLayout={isAdminLayout}
            shouldCenterItems={isAdminLayout}
          />
        </div>
        <RenderWhen.False>
          <Skeleton className={css.loadingSkeleton} />
        </RenderWhen.False>
      </RenderWhen>
    </RenderWhen>
  );
};

export default ReviewOrderStatesSection;
