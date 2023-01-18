import Button from '@components/Button/Button';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import ReviewOrdersResultModal from './ReviewOrdersResultModal';
import css from './ReviewOrdersResultSection.module.scss';

const isCompletePickFood = ({
  participantId,
  orderDetail,
}: {
  participantId: string;
  orderDetail: TObject;
}) => {
  const allOrderDetails = Object.values(orderDetail);
  const totalDates = allOrderDetails.length;

  const completedDates = allOrderDetails.reduce((result: number, current) => {
    const { memberOrders } = current as TObject;
    const { status, foodId } = memberOrders[participantId];

    if (foodId !== '' && status === EParticipantOrderStatus.joined) {
      return result + 1;
    }
    return result;
  }, 0);

  return completedDates === totalDates;
};

type TReviewOrdersResultSectionProps = {
  className?: string;
  goBackToEditMode: () => void;
  data: TObject;
};

const ReviewOrdersResultSection: React.FC<TReviewOrdersResultSectionProps> = (
  props,
) => {
  const { className, goBackToEditMode, data } = props;
  const intl = useIntl();
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const { participants, orderDetail } = data;
  const rootClasses = classNames(css.root, className);

  const completedPickFoodParticipants = participants.filter((pid: string) =>
    isCompletePickFood({
      participantId: pid,
      orderDetail,
    }),
  );

  const handleClickButtonViewResult = () => {
    setIsResultModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsResultModalOpen(false);
  };

  return (
    <div className={rootClasses}>
      <div className={css.titleContainer}>
        <div className={css.title}>
          {intl.formatMessage({ id: 'ReviewOrdersResultSection.title' })}
        </div>
        <div className={css.subtitle}>
          {intl.formatMessage(
            { id: 'ReviewOrdersResultSection.subtitle' },
            { count: completedPickFoodParticipants.length },
          )}
        </div>
      </div>
      <Button
        variant="inline"
        type="button"
        className={css.viewResultButton}
        onClick={handleClickButtonViewResult}>
        {intl.formatMessage({ id: 'ReviewOrdersResultSection.viewResultText' })}
      </Button>
      <ReviewOrdersResultModal
        data={data}
        goBackToEditMode={goBackToEditMode}
        isOpen={isResultModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ReviewOrdersResultSection;
