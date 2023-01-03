import { DateTime } from 'luxon';
import React from 'react';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import type { TEventStatus } from '../../helpers/types';
import { submitDishSelection } from './api.helpers';
import DishSelectionForm from './DishSelectionForm';
import EventCardContentItems from './EventCardContentItems';
import css from './EventCardPopup.module.scss';
import EventCardStatus from './EventCardStatus';

type TEventCardPopupProps = {
  event: Event;
  status?: TEventStatus;
};

const EventCardPopup: React.FC<TEventCardPopupProps> = ({ event, status }) => {
  const mealType = event.resource?.type;
  const startTime = event.start
    ? DateTime.fromJSDate(event.start).toLocaleString(DateTime.TIME_24_SIMPLE)
    : null;
  const dishes: any[] = event.resource?.meal?.dishes || [];

  const onSelectDish = (values: any, reject?: boolean) => {
    submitDishSelection(values, reject);
  };

  return (
    <div className={css.root}>
      <div className={css.header}>
        <div className={css.title}>{event.title}</div>
        {status && <EventCardStatus status={status} />}
      </div>
      <div className={css.mealType}>
        <FormattedMessage id={`EventCard.mealType.${mealType}`} />
      </div>
      <div className={css.eventTime}>{startTime}</div>
      <div className={css.divider} />
      <EventCardContentItems event={event} />
      <div className={css.divider} />
      <div className={css.selectFoodForm}>
        <div className={css.selectFoodHeader}>
          <div className={css.formTitle}>
            <FormattedMessage id="EventCard.form.selectFood" />
          </div>
          <div className={css.viewDetail}>
            <FormattedMessage id="EventCard.form.viewDetail" />
          </div>
        </div>
        <div className={css.selectDishContent}>
          <DishSelectionForm dishes={dishes} onSubmit={onSelectDish} />
        </div>
      </div>
    </div>
  );
};

export default EventCardPopup;
