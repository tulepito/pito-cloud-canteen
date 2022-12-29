import classNames from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { EVENT_STATUS } from '../../helpers/constant';
import type { TEventStatus } from '../../helpers/types';
import css from './EventCard.module.scss';

type TEventCardStatusProps = {
  status: TEventStatus;
  className?: string;
};

const EventCardStatus: React.FC<TEventCardStatusProps> = ({
  status,
  className,
}) => {
  return (
    <div
      className={classNames(css.status, className, {
        [css.emptyStatus]: status === EVENT_STATUS.EMPTY_STATUS,
        [css.joinedStatus]: status === EVENT_STATUS.JOINED_STATUS,
        [css.notJoinedStatus]: status === EVENT_STATUS.NOT_JOINED_STATUS,
        [css.expiredStatus]: status === EVENT_STATUS.EXPIRED_STATUS,
      })}>
      <FormattedMessage id={`DayColumn.Status.${status}`} />
    </div>
  );
};

export default EventCardStatus;
