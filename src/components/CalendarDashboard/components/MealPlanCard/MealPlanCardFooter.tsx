import Button from '@components/Button/Button';
import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import ApplyOtherDaysModal from './components/ApplyOtherDaysModal';
import css from './MealPlanCard.module.scss';

type TMealPlanCardFooterProps = {
  event: Event;
  onPickFoodModal: () => void;
};

const MealPlanCardFooter: React.FC<TMealPlanCardFooterProps> = ({
  event,
  onPickFoodModal,
}) => {
  const foodList = event.resource.foodList || [];
  const [isOpenApplyOtherDaysModal, setIsOpenApplyOtherDaysModal] =
    useState<boolean>(false);

  const handleOpenApplyOtherDaysModal = () => {
    setIsOpenApplyOtherDaysModal(true);
  };
  const handleCloseApplyOtherDaysModal = () => {
    setIsOpenApplyOtherDaysModal(false);
  };

  return (
    <div className={css.footer}>
      {foodList.length > 0 ? (
        <Button className={css.actionButton}>
          <FormattedMessage id="MealPlanCard.footer.modify" />
        </Button>
      ) : (
        <Button className={css.actionButton} onClick={onPickFoodModal}>
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
