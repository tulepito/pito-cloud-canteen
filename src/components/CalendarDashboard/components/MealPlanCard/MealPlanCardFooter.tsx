import { useState } from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { convertWeekDay } from '@src/utils/dates';
import { EInvalidRestaurantCase } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

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
  availableStatus?: TObject;
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
  availableStatus,
}) => {
  const { id, isSelectedFood, restaurant = {} } = event.resource || {};
  const { status, isAvailable = true } = availableStatus || {};
  const [isOpenApplyOtherDaysModal, setIsOpenApplyOtherDaysModal] =
    useState<boolean>(false);
  const walkthroughStep = useAppSelector(
    (state) => state.BookerDraftOrderPage.walkthroughStep,
  );

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
      <RenderWhen condition={isAvailable}>
        <Button
          variant="secondary"
          className={classNames(css.actionButton, {
            [css.walkthrough]: walkthroughStep === 4,
          })}
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
          <IconCopy className={css.copyingIcon} />
          <FormattedMessage id="MealPlanCard.footer.applyForOtherDays" />
        </div>

        <RenderWhen.False>
          <div className={css.editNotAvailable}>
            <RenderWhen condition={status === EInvalidRestaurantCase.closed}>
              <FormattedMessage id="MealPlanCard.footer.restaurantClosed" />
              <RenderWhen.False>
                <FormattedMessage id="MealPlanCard.footer.restaurantHasNoValidMenus" />
              </RenderWhen.False>
            </RenderWhen>
          </div>
        </RenderWhen.False>
      </RenderWhen>

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
