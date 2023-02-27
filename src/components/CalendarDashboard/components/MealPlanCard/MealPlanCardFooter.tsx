import Button from '@components/Button/Button';
import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import ApplyOtherDaysModal from './components/ApplyOtherDaysModal';
import css from './MealPlanCard.module.scss';

type TMealPlanCardFooterProps = {
  event: Event;
  onPickFoodModal?: () => void;
  onPickFoodInProgress?: boolean;
};

const MealPlanCardFooter: React.FC<TMealPlanCardFooterProps> = ({
  event,
  onPickFoodModal,
  onPickFoodInProgress,
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
      <Button
        className={css.actionButton}
        onClick={onPickFoodModal}
        inProgress={onPickFoodInProgress}>
        {foodList.length > 0 ? (
          <FormattedMessage id="MealPlanCard.footer.modify" />
        ) : (
          <FormattedMessage id="MealPlanCard.footer.selectDish" />
        )}
      </Button>
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
