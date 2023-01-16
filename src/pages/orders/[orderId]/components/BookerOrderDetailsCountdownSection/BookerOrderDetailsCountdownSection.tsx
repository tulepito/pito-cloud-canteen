import Button from '@components/Button/Button';
import CountdownTimer from '@components/CountdownTimer/CountdownTimer';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import css from './BookerOrderDetailsCountdownSection.module.scss';
import type { TEditOrderDeadlineFormValues } from './EditOrderDeadlineForm';
import EditOrderDeadlineModal from './EditOrderDeadlineModal';

type BookerOrderDetailsCountdownSectionProps = {
  rootClassName?: string;
  className?: string;
  data: {
    orderDeadline: number;
    startDate: number;
  };
};

const BookerOrderDetailsCountdownSection: React.FC<
  BookerOrderDetailsCountdownSectionProps
> = (props) => {
  const intl = useIntl();
  const [isEditOrderDeadlineModalOpen, setIsEditOrderDeadlineModalOpen] =
    useState(false);

  const {
    className,
    rootClassName,
    data: { orderDeadline, startDate },
  } = props;
  console.log(orderDeadline);

  const rootClasses = classNames(rootClassName || css.root, className);

  const formattedDeadline = DateTime.fromMillis(orderDeadline).toFormat(
    "HH:mm, dd 'tháng' MM, yyyy",
  );

  const sectionTitle = intl.formatMessage({
    id: 'BookerOrderDetailsCountdownSection.title',
  });
  const orderEndAtMessage = intl.formatMessage(
    {
      id: 'BookerOrderDetailsCountdownSection.orderEndAt',
    },
    {
      deadline: <b>{formattedDeadline}</b>,
    },
  );

  const editDeadlineText = intl.formatMessage({
    id: 'BookerOrderDetailsCountdownSection.editDeadline',
  });

  const handleClickEditIcon = () => {
    setIsEditOrderDeadlineModalOpen(true);
  };
  const handleCloseEditDeadlineModal = () => {
    setIsEditOrderDeadlineModalOpen(false);
  };

  const handleSubmitEditDeadline = (values: TEditOrderDeadlineFormValues) => {
    console.log(values);
    setIsEditOrderDeadlineModalOpen(false);
  };

  return (
    <div className={rootClasses}>
      <div className={css.title}>{sectionTitle}</div>
      <Button
        variant="inline"
        className={css.editDeadlineContainer}
        onClick={handleClickEditIcon}>
        <div className={css.editDeadlineContent}>
          <IconEdit className={css.editIcon} />
          <div>{editDeadlineText}</div>
        </div>
      </Button>
      <CountdownTimer deadline={orderDeadline} stopAt={0} />
      <div className={css.orderEndAtMessage}>{orderEndAtMessage}</div>
      <EditOrderDeadlineModal
        data={{ orderDeadline, orderStartDate: startDate }}
        isOpen={isEditOrderDeadlineModalOpen}
        onClose={handleCloseEditDeadlineModal}
        onSubmit={handleSubmitEditDeadline}
      />
    </div>
  );
};

export default BookerOrderDetailsCountdownSection;
