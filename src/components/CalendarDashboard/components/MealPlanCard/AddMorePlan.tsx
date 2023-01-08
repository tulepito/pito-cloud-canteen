import Button from '@components/Button/Button';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import classNames from 'classnames';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import css from './AddMorePlan.module.scss';

export type TAddMorePlanProps = {
  className?: string;
  events: Event[];
  date: Date;
  startDate: number;
  endDate: number;
  onClick: (date: Date) => () => void;
};

const AddMorePlan: React.FC<TAddMorePlanProps> = ({
  className,
  events = [],
  date,
  startDate,
  endDate,
  onClick,
}) => {
  const dateInNumberType = Number(date);
  const isValidDate =
    dateInNumberType >= startDate && dateInNumberType <= endDate;
  const showCondition = events.length < 1 && isValidDate;

  return (
    <>
      {showCondition && (
        <div className={classNames(css.root, className)}>
          <Button className={css.addMore} onClick={onClick(date)} type="button">
            <IconPlus className={css.plusIcon} />
            <FormattedMessage id="AddMorePlan.addMore" />
          </Button>
          {(!events || events.length === 0) && (
            <div className={css.haveNoMeal}>
              <FormattedMessage id="AddMorePlan.haveNoMeal" />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AddMorePlan;
