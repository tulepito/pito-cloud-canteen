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

const prepareItemFromData = (transactionMap: TObject<number, TTransaction>) => {
  const items = Object.entries(transactionMap)
    .map(([date, tx]) => {
      return { date: Number(date), tx };
    })
    .sort((item, item2) => item.date - item2.date)
    .map(({ date, tx }) => {
      return { date: formatTimestamp(Number(date), 'dd/M/yyyy'), tx };
    });

  return items;
};

type TReviewOrderStatesSectionProps = {
  data: {
    transactionDataMap: {
      [date: number]: TTransaction;
    };
    isCanceledOrder: boolean;
  };
  isAdminLayout?: boolean;
  className?: string;
};

const ReviewOrderStatesSection: React.FC<TReviewOrderStatesSectionProps> = ({
  data: { transactionDataMap, isCanceledOrder },
  isAdminLayout = false,
  className,
}) => {
  const items = useMemo(
    () => prepareItemFromData(transactionDataMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(transactionDataMap)],
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
