import HorizontalTimeLine from '@components/TimeLine/HorizontalTimeLine';
import StateItem from '@components/TimeLine/StateItem';
import { formatTimestamp } from '@utils/dates';
import type { TObject, TTransaction } from '@utils/types';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';

import css from './ReviewOrderStatesSection.module.scss';

const prepareItemFromData = (transactionMap: TObject<number, TTransaction>) => {
  const items = Object.entries(transactionMap)
    .map(([date, tx]) => {
      return { date: Number(date), tx };
    })
    .sort((item, item2) => item.date - item2.date)
    .map(({ date, tx }) => {
      return { date: formatTimestamp(Number(date)), tx };
    });

  return items;
};

type TReviewOrderStatesSectionProps = {
  data: {
    [date: number]: TTransaction;
  };
};

const ReviewOrderStatesSection: React.FC<TReviewOrderStatesSectionProps> = ({
  data,
}) => {
  const items = useMemo(
    () => prepareItemFromData(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(data)],
  );

  return (
    <>
      {!isEmpty(items) && (
        <div className={css.root}>
          <HorizontalTimeLine
            items={items}
            itemComponent={StateItem}
            haveNavigators
          />
        </div>
      )}
    </>
  );
};

export default ReviewOrderStatesSection;
