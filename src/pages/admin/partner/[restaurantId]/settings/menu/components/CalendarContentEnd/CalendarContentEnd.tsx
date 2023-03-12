import React from 'react';
import { FormattedMessage } from 'react-intl';

import { IntegrationListing } from '@utils/data';
import { getDayOfWeekByIndex } from '@utils/dates';

import css from './CalendarContentEnd.module.scss';

const CalendarContentEnd = (props: any) => {
  const { events = [], date, currentMenu } = props;
  const dayAsIndex = new Date(date).getDay() - 1;
  const dayOfWeekToCompare = getDayOfWeekByIndex(dayAsIndex);

  const { daysOfWeek: daysOfWeekFromMenu = [] } =
    IntegrationListing(currentMenu).getPublicData();
  if (!daysOfWeekFromMenu.includes(dayOfWeekToCompare)) {
    return <></>;
  }
  const noFood = events.length === 0;

  return noFood ? (
    <div className={css.noFood}>
      <FormattedMessage id="EditMenuPricingForm.noFoods" />
    </div>
  ) : (
    <></>
  );
};

export default CalendarContentEnd;
