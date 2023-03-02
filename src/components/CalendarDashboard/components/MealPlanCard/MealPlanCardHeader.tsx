import IconClose from '@components/Icons/IconClose/IconClose';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
import IconUser from '@components/Icons/IconUser/IconUser';
import { formatTimestamp } from '@utils/dates';
import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import DeleteMealModal from './components/DeleteMealModal';
import css from './MealPlanCard.module.scss';

type TMealPlanCardHeaderProps = {
  event: Event;
  removeInprogress?: boolean;
  removeEventItem?: (resourceId: string) => void;
};

const MealPlanCardHeader: React.FC<TMealPlanCardHeaderProps> = ({
  event,
  removeInprogress,
  removeEventItem,
}) => {
  const session = event.resource?.daySession;
  const resourceId = event.resource?.id;
  const handleDelete = () => {
    removeEventItem?.(resourceId);
  };
  // const suitableAmount = event.resource?.suitableAmount;

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const handleOpenDeleteModal = () => {
    setIsOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);
  };

  return (
    <div className={css.header}>
      <div className={css.planTitle}>
        <FormattedMessage id={`DayColumn.Session.${session}`} />
        <IconClose className={css.close} onClick={handleOpenDeleteModal} />
      </div>
      <div className={css.headerActions}>
        <IconUser />
        <div className={css.suitableAmount}>{''}</div>
        <div className={css.verticalDivider} />
        <IconMagnifier className={css.searchIcon} />
      </div>
      <DeleteMealModal
        isOpen={isOpenDeleteModal}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        removeInprogress={removeInprogress}
        deleteDate={formatTimestamp(event.start?.getTime(), 'dd MMMM')}
      />
    </div>
  );
};

export default MealPlanCardHeader;
