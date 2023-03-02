import { InlineTextButton } from '@components/Button/Button';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import { IntegrationListing } from '@utils/data';
import { getDayOfWeekByIndex } from '@utils/dates';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import css from './CalendarContentStart.module.scss';

const CalendarContentStart = (props: any) => {
  const { date, events = [], currentMenu, onSetCurrentDate } = props;
  const dayAsIndex = new Date(date).getDay() - 1;
  const dayOfWeekToCompare = getDayOfWeekByIndex(dayAsIndex);

  const { daysOfWeek: daysOfWeekFromMenu = [] } =
    IntegrationListing(currentMenu).getPublicData();
  if (!daysOfWeekFromMenu.includes(dayOfWeekToCompare)) {
    return <></>;
  }
  return (
    <InlineTextButton
      onClick={onSetCurrentDate({ date, events })}
      className={css.addButton}>
      <div className={css.iconAdd}>
        <IconAdd />
      </div>
      <FormattedMessage id="EditMenuPricingForm.addFoodButton" />
    </InlineTextButton>
  );
};

export default CalendarContentStart;
