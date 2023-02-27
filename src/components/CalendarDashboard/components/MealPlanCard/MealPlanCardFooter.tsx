import Button from '@components/Button/Button';
import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import ApplyOtherDaysModal from './components/ApplyOtherDaysModal';
import css from './MealPlanCard.module.scss';

type TMealPlanCardFooterProps = {
  event: Event;
  onEditFood: (date: string, restaurantId: string, menuId: string) => void;
  editFoodInprogress: boolean;
};

const MealPlanCardFooter: React.FC<TMealPlanCardFooterProps> = ({
  event,
  onEditFood,
  editFoodInprogress,
}) => {
  const { id, isSelectedFood, restaurant = {} } = event.resource || {};
  const [isOpenApplyOtherDaysModal, setIsOpenApplyOtherDaysModal] =
    useState<boolean>(false);

  const handleOpenApplyOtherDaysModal = () => {
    setIsOpenApplyOtherDaysModal(true);
  };
  const handleCloseApplyOtherDaysModal = () => {
    setIsOpenApplyOtherDaysModal(false);
  };

  const handleEditFood = () => {
    onEditFood(id, restaurant.id, restaurant.menuId);
  };

  return (
    <div className={css.footer}>
      {isSelectedFood ? (
        <Button
          className={css.actionButton}
          onClick={handleEditFood}
          inProgress={editFoodInprogress}>
          <FormattedMessage id="MealPlanCard.footer.modify" />
        </Button>
      ) : (
        <Button
          className={css.actionButton}
          onClick={handleEditFood}
          inProgress={editFoodInprogress}>
          <FormattedMessage id="MealPlanCard.footer.selectDish" />
        </Button>
      )}
      <div
        className={css.applyForOtherDays}
        onClick={handleOpenApplyOtherDaysModal}>
        <FormattedMessage id="MealPlanCard.footer.applyForOtherDays" />
      </div>
      <ApplyOtherDaysModal
        isOpen={isOpenApplyOtherDaysModal}
        onClose={handleCloseApplyOtherDaysModal}
      />
    </div>
  );
};

export default MealPlanCardFooter;
