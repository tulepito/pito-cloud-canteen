import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { formatTimestamp } from '@utils/dates';

import DeleteMealModal from './components/DeleteMealModal';

import css from './MealPlanCard.module.scss';

type TMealPlanCardHeaderProps = {
  event: Event;
  removeInprogress?: boolean;
  shouldHideRemoveIcon?: boolean;
  removeEventItem?: (resourceId: string) => void;
  onSearchRestaurant?: (date: Date) => void;
};

const MealPlanCardHeader: React.FC<TMealPlanCardHeaderProps> = ({
  event,
  removeInprogress,
  removeEventItem,
  onSearchRestaurant,
  shouldHideRemoveIcon = false,
}) => {
  const {
    isSelectedFood,
    daySession: session,
    id: resourceId,
    meal = {},
  } = event?.resource || {};
  const dishes = meal.dishes || [];
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

  const handleSearchRestaurant = () => {
    onSearchRestaurant?.(event?.start!);
  };

  return (
    <div className={css.header}>
      <div className={css.planTitle}>
        <div className={css.titleContainer}>
          <RenderWhen condition={isSelectedFood}>
            <IconTickWithBackground className={css.tickIcon} />
          </RenderWhen>
          <FormattedMessage id={`DayColumn.Session.${session}`} />
        </div>
        <RenderWhen condition={!shouldHideRemoveIcon}>
          <IconClose
            className={css.close}
            onClick={handleOpenDeleteModal}
            data-tour="step-5"
          />
        </RenderWhen>
      </div>
      <div className={css.headerActions}>
        <IconFood className={css.foodIcon} />
        <div className={css.dishes}>{dishes.length}</div>
        <div className={css.verticalDivider} />
        <IconMagnifier
          className={css.searchIcon}
          onClick={handleSearchRestaurant}
          data-tour="step-3"
        />
      </div>
      <DeleteMealModal
        id="DeleteMealModal"
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
