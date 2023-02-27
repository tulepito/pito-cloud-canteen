import HorizontalTimeLine from '@components/TimeLine/HorizontalTimeLine';
import StateItem from '@components/TimeLine/StateItem';
import { parseTimestampToFormat } from '@utils/dates';
import type { TObject, TTransaction } from '@utils/types';

import css from './ReviewOrderStatesSection.module.scss';

export const prepareItemFromData = (
  transactionMap: TObject<number, TTransaction>,
) => {
  const items = Object.entries(transactionMap)
    .map(([date, tx]) => {
      return { date: Number(date), tx };
    })
    .sort((item) => item.date)
    .map(({ date, tx }) => {
      return { date: parseTimestampToFormat(Number(date)), tx };
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
  const items = prepareItemFromData(data);

  return (
    <div className={css.root}>
      <HorizontalTimeLine
        items={items}
        itemComponent={StateItem}
        haveNavigators
      />
    </div>
  );
};

export default ReviewOrderStatesSection;
