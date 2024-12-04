import React from 'react';
import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import CountdownTimer from '@components/CountdownTimer/CountdownTimer';

import css from './SectionCountdown.module.scss';

type TSectionCountDownProps = {
  orderDeadline: number;
};

const SectionCountdown: React.FC<TSectionCountDownProps> = ({
  orderDeadline,
}) => {
  const intl = useIntl();

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

  return (
    <div className={css.root}>
      <p className={css.title}>{sectionTitle}</p>
      <CountdownTimer deadline={orderDeadline} stopAt={0} />
      <p className={css.orderEndAtMessage}>{orderEndAtMessage}</p>
    </div>
  );
};

export default SectionCountdown;
