import CountdownTimer from '@components/CountdownTimer/CountdownTimer';
import Toggle from '@components/Toggle/Toggle';
import useBoolean from '@hooks/useBoolean';
import { DateTime } from 'luxon';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './SectionCountdown.module.scss';

type TSectionCountDownProps = {
  orderDeadline: number;
};

const SectionCountdown: React.FC<TSectionCountDownProps> = ({
  orderDeadline,
}) => {
  // State
  const receiveNotificationControl = useBoolean(false);
  const intl = useIntl();

  // Functions

  const onReceiveNotification = (value: boolean) => {
    // TODO: logic notification later
    receiveNotificationControl.setValue(value);
  };

  // Renderers
  const sectionTitle = intl.formatMessage({
    id: 'SectionCountDown.sectionTitle',
  });
  const deadlineDateObj = DateTime.fromMillis(orderDeadline);
  const orderEndAtLabel = intl.formatMessage({
    id: 'SectionCountdown.orderEndAtLabel',
  });
  const orderEndAtMessage = intl.formatMessage(
    {
      id: 'SectionCountdown.orderEndAtMessage',
    },
    {
      label: <span className={css.orderEndAtLabel}>{orderEndAtLabel}</span>,
      hour: deadlineDateObj.toFormat('T'),
      day: deadlineDateObj.get('day'),
      month: deadlineDateObj.get('month'),
      year: deadlineDateObj.get('year'),
    },
  );
  const toggleNotificationTitle = intl.formatMessage({
    id: 'SectionCountdown.toggleNotificationLabel',
  });

  return (
    <div className={css.root}>
      <p className={css.title}>{sectionTitle}</p>
      <CountdownTimer deadline={orderDeadline} stopAt={0} />
      <p className={css.orderEndAtMessage}>{orderEndAtMessage}</p>
      <div className={css.toggleNotification}>
        <span>
          <Toggle
            status="off"
            label={toggleNotificationTitle}
            onClick={onReceiveNotification}
          />
        </span>
      </div>
    </div>
  );
};

export default SectionCountdown;
