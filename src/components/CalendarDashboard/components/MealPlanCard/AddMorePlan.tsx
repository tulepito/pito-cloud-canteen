import Button from '@components/Button/Button';
import IconPlus from '@components/IconPlus/IconPlus';
import classNames from 'classnames';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import css from './AddMorePlan.module.scss';

type TAddMorePlanProps = {
  className?: string;
  events?: Event[];
};

const AddMorePlan: React.FC<TAddMorePlanProps> = ({ className, events }) => {
  return (
    <div className={classNames(css.root, className)}>
      <Button className={css.addMore}>
        <IconPlus className={css.plusIcon} />
        <FormattedMessage id="AddMorePlan.addMore" />
      </Button>
      {(!events || events.length === 0) && (
        <div className={css.haveNoMeal}>
          <FormattedMessage id="AddMorePlan.haveNoMeal" />
        </div>
      )}
    </div>
  );
};

export default AddMorePlan;
