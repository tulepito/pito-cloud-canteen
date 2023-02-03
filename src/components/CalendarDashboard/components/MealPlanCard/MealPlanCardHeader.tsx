import IconClose from '@components/Icons/IconClose/IconClose';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
import IconUser from '@components/Icons/IconUser/IconUser';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import css from './MealPlanCard.module.scss';

type TMealPlanCardHeaderProps = {
  event: Event;
  removeEventItem?: (resourceId: string) => void;
};

const MealPlanCardHeader: React.FC<TMealPlanCardHeaderProps> = ({
  event,
  removeEventItem,
}) => {
  const session = event.resource?.daySession;
  const resourceId = event.resource?.id;
  // const suitableAmount = event.resource?.suitableAmount;
  const handleClose = () => {
    removeEventItem?.(resourceId);
  };
  return (
    <div className={css.header}>
      <div className={css.planTitle}>
        <FormattedMessage id={`DayColumn.Session.${session}`} />
        <IconClose className={css.close} onClick={handleClose} />
      </div>
      <div className={css.headerActions}>
        <IconUser />
        <div className={css.suitableAmount}>{''}</div>
        <div className={css.verticalDivider} />
        <IconMagnifier className={css.searchIcon} />
      </div>
    </div>
  );
};

export default MealPlanCardHeader;
