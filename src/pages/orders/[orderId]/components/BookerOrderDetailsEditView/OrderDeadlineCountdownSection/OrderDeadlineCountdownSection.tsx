import Button from '@components/Button/Button';
import CountdownTimer from '@components/CountdownTimer/CountdownTimer';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import { useAppDispatch } from '@hooks/reduxHooks';
import type { TDefaultProps } from '@utils/types';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import { orderManagementsThunks } from '../../../OrderManagement.slice';
import type { TEditOrderDeadlineFormValues } from './EditOrderDeadlineForm';
import EditOrderDeadlineModal from './EditOrderDeadlineModal';
import css from './OrderDeadlineCountdownSection.module.scss';

type TOrderDeadlineCountdownSectionProps = TDefaultProps & {
  data: {
    startDate: number;
    deadlineHour: string;
    orderDeadline: number;
  };
};

const OrderDeadlineCountdownSection: React.FC<
  TOrderDeadlineCountdownSectionProps
> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [isEditOrderDeadlineModalOpen, setIsEditOrderDeadlineModalOpen] =
    useState(false);

  const {
    className,
    rootClassName,
    data: { startDate, deadlineHour, orderDeadline },
  } = props;
  const currentTime = new Date().getTime();
  const rootClasses = classNames(rootClassName || css.root, className);

  const disabledEditButton = currentTime >= orderDeadline;
  const formattedDeadline = DateTime.fromMillis(orderDeadline).toFormat(
    "HH:mm, dd 'tháng' MM, yyyy",
  );

  const sectionTitle = intl.formatMessage({
    id: 'OrderDeadlineCountdownSection.title',
  });
  const orderEndAtMessage = intl.formatMessage(
    {
      id: 'OrderDeadlineCountdownSection.orderEndAt',
    },
    {
      deadline: <b>{formattedDeadline}</b>,
    },
  );

  const editDeadlineText = intl.formatMessage({
    id: 'OrderDeadlineCountdownSection.editDeadline',
  });

  const handleClickEditIcon = () => {
    setIsEditOrderDeadlineModalOpen(true);
  };
  const handleCloseEditDeadlineModal = () => {
    setIsEditOrderDeadlineModalOpen(false);
  };

  const handleSubmitEditDeadline = (values: TEditOrderDeadlineFormValues) => {
    const {
      deadlineDate: deadlineDateFromSubmission,
      deadlineHour: deadlineHourFromSubmission,
    } = values;
    const parsedDeadlineDate = DateTime.fromMillis(
      deadlineDateFromSubmission,
    ).toFormat('yyyy-MM-dd');
    const newOrderDeadline = DateTime.fromISO(
      `${parsedDeadlineDate}T${deadlineHourFromSubmission}:00`,
    ).toMillis();

    const updateData = {
      deadlineDate: deadlineDateFromSubmission,
      deadlineHour: deadlineHourFromSubmission,
      orderDeadline: newOrderDeadline,
    };

    dispatch(orderManagementsThunks.updateOrderGeneralInfo(updateData));
    setIsEditOrderDeadlineModalOpen(false);
  };

  return (
    <div className={rootClasses}>
      <div className={css.title}>{sectionTitle}</div>
      <Button
        disabled={disabledEditButton}
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
        data={{
          orderDeadline,
          orderStartDate: startDate,
          orderDeadlineHour: deadlineHour,
        }}
        isOpen={isEditOrderDeadlineModalOpen}
        onClose={handleCloseEditDeadlineModal}
        onSubmit={handleSubmitEditDeadline}
      />
    </div>
  );
};

export default OrderDeadlineCountdownSection;
