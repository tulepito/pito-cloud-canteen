import HorizontalTimeLine from '@components/TimeLine/HorizontalTimeLine';
import StateItem from '@components/TimeLine/StateItem';

import css from './ReviewOrderStatesSection.module.scss';

type TReviewOrderStatesSectionProps = {};

const ReviewOrderStatesSection: React.FC<
  TReviewOrderStatesSectionProps
> = () => {
  const items = [
    { state: '', date: '16/9/2022' },
    { state: '', date: '17/9/2022' },
    { state: '', date: '18/9/2022' },
    { state: '', date: '19/9/2022' },
    { state: '', date: '20/9/2022' },
    { state: '', date: '20/9/2022' },
    { state: '', date: '20/9/2022' },
    { state: '', date: '20/9/2022' },
  ];

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
