import IconClose from '@components/Icons/IconClose/IconClose';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
import IconUser from '@components/Icons/IconUser/IconUser';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import css from './MealPlanCard.module.scss';

type TMealPlanCardHeaderProps = {
  event: Event;
};

const MealPlanCardHeader: React.FC<TMealPlanCardHeaderProps> = ({ event }) => {
  const session = event.resource?.daySession;
  const suitableAmount = event.resource?.suitableAmount;

  return (
    <div className={css.header}>
      <div className={css.planTitle}>
        <FormattedMessage id={`DayColumn.Session.${session}`} />
        <IconClose className={css.close} />
      </div>
      <div className={css.headerActions}>
        <IconUser />
        <div className={css.suitableAmount}>{suitableAmount}</div>
        <div className={css.verticalDivider} />
        <IconMagnifier className={css.searchIcon} />
      </div>
    </div>
  );
};

export default MealPlanCardHeader;
