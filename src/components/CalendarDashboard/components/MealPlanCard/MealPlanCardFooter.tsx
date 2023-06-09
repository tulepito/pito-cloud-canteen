import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import { convertWeekDay } from '@src/utils/dates';

import ApplyOtherDaysModal from './components/ApplyOtherDaysModal';

import css from './MealPlanCard.module.scss';

type TMealPlanCardFooterProps = {
  event: Event;
  onEditFood: (date: string, restaurantId: string, menuId: string) => void;
  onApplyOtherDays?: (date: string, selectedDates: string[]) => void;
  editFoodInprogress: boolean;
  dayInWeek?: string[];
  onApplyOtherDaysInProgress?: boolean;
  startDate?: Date | number;
  endDate?: Date | number;
  editAvailable?: boolean;
};

const MealPlanCardFooter: React.FC<TMealPlanCardFooterProps> = ({
  event,
  onEditFood,
  onApplyOtherDays,
  editFoodInprogress,
  dayInWeek,
  onApplyOtherDaysInProgress,
  startDate,
  endDate,
  editAvailable = true,
}) => {
  const { id, isSelectedFood, restaurant = {} } = event.resource || {};
  const [isOpenApplyOtherDaysModal, setIsOpenApplyOtherDaysModal] =
    useState<boolean>(false);

  const currentDayInWeek = convertWeekDay(
    DateTime.fromMillis(Number(event?.start?.getTime())).weekday,
  ).key;
  const handleOpenApplyOtherDaysModal = () => {
    setIsOpenApplyOtherDaysModal(true);
  };
  const handleCloseApplyOtherDaysModal = () => {
    setIsOpenApplyOtherDaysModal(false);
  };

  const handleEditFood = () => {
    onEditFood(id, restaurant.id, restaurant.menuId);
  };

  const handleApplyOtherDays = async (selectedDates: string[]) => {
    await onApplyOtherDays?.(`${event?.start?.getTime()}`, selectedDates);
    setIsOpenApplyOtherDaysModal(false);
  };

  return (
    <div className={css.footer}>
      {!editAvailable ? (
        <div className={css.editNotAvailable}>Nhà hàng không còn phù hợp</div>
      ) : (
        <>
          <Button
            variant="secondary"
            className={css.actionButton}
            onClick={handleEditFood}
            data-tour="step-5"
            inProgress={editFoodInprogress}>
            {isSelectedFood ? (
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
        </>
      )}

      <ApplyOtherDaysModal
        isOpen={isOpenApplyOtherDaysModal}
        onClose={handleCloseApplyOtherDaysModal}
        currentDayInWeek={currentDayInWeek}
        onSubmit={handleApplyOtherDays}
        dayInWeek={dayInWeek}
        inProgress={onApplyOtherDaysInProgress}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default MealPlanCardFooter;
