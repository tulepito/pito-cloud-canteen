import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import type { Duration } from 'luxon';
import { DateTime } from 'luxon';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import type { TDefaultProps, TObject } from '@utils/types';

import css from './OrderTitle.module.scss';

const stopTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };

type TOrderTitleProps = TDefaultProps & {
  data: {
    deliveryHour: string;
    deliveryAddress: TObject;
    canStartOrder: boolean;
    isGroupOrder: boolean;
    deadlineHour: string;
    deadlineDate: number;
  };
  onConfirmOrder: () => void;
  onCancelOrder: () => void;
  confirmButtonMessage?: string;
  cancelButtonMessage?: string;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
  confirmInProgress?: boolean;
  isDraftEditing: boolean;
};

const OrderTitle: React.FC<TOrderTitleProps> = (props) => {
  const {
    rootClassName,
    className,
    data: {
      deliveryHour,
      deliveryAddress = {},
      canStartOrder = false,
      deadlineDate,
      deadlineHour,
      isGroupOrder = false,
    },
    onConfirmOrder,
    onCancelOrder,
    confirmButtonMessage,
    cancelButtonMessage,
    cancelDisabled = false,
    confirmDisabled,
    confirmInProgress,
    isDraftEditing,
  } = props;
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const [diffTime, setDiffTime] = useState<Duration | null>(null);

  const formattedTimeLeft =
    diffTime === null
      ? DateTime.fromMillis(deadlineDate)
          .diffNow()
          .toFormat("d'd':h'h':mm'm':ss's'")
      : (diffTime! as Duration).toFormat("d'd':h'h':mm'm':ss's'");

  const submitDisabled =
    (!isDraftEditing && !canStartOrder) || inProgress || confirmDisabled;
  const cancelOrderDisabled = cancelDisabled || inProgress;

  const rootClasses = classNames(rootClassName || css.root, className);

  const deliveryInfo = intl.formatMessage(
    {
      id: 'EditView.OrderTitle.deliveryInfo',
    },
    {
      time: <b>{deliveryHour || '12:00'}</b>,
      place: (
        <b>
          {deliveryAddress.address ||
            '123 Nguyễn Công Trứ, phường 3, quận 3, HCM'}
        </b>
      ),
    },
  ) as string;

  const timeLeftText = intl.formatMessage(
    {
      id: 'EditView.OrderTitle.timeLeft',
    },
    {
      timeLeft: <span className={css.timeLeftTime}>{formattedTimeLeft}</span>,
    },
  );
  const formattedDeadlineDate = DateTime.fromMillis(deadlineDate).toFormat(
    "HH:mm, dd 'tháng' MM, yyyy",
  );

  const actionButtons = (
    <div className={css.actions}>
      {!!confirmButtonMessage && (
        <Button
          disabled={submitDisabled}
          type="button"
          variant="cta"
          className={css.makeOrderBtn}
          inProgress={confirmInProgress}
          onClick={onConfirmOrder}>
          {confirmButtonMessage}
        </Button>
      )}
      {!!cancelButtonMessage && (
        <Button
          disabled={cancelOrderDisabled}
          type="button"
          variant="secondary"
          className={css.cancelOrderBtn}
          onClick={onCancelOrder}>
          {cancelButtonMessage}
        </Button>
      )}
    </div>
  );

  useEffect(() => {
    if (isEmpty(deadlineHour)) {
      return;
    }
    const intervalId = setInterval(() => {
      let diffObj = DateTime.fromMillis(
        parseInt(`${deadlineDate}`, 10),
      ).diffNow(['day', 'hour', 'minute', 'second']);
      if (stopTime !== null) {
        if (
          diffObj.get('days') <= stopTime.days &&
          diffObj.get('hours') <= stopTime.hours &&
          diffObj.get('minutes') <= stopTime.minutes &&
          diffObj.get('seconds') <= stopTime.seconds
        ) {
          diffObj = diffObj.set({
            ...stopTime,
          });
          clearInterval(intervalId);
        }
      }
      setDiffTime(diffObj);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [deadlineDate, deadlineHour]);

  return (
    <div className={rootClasses}>
      <div>
        <div className={css.titleText}>
          {intl.formatMessage({ id: 'EditView.OrderTitle.title' })}
        </div>
        <Badge label={deliveryInfo} />
      </div>
      <RenderWhen condition={isMobileLayout}>
        <MobileBottomContainer className={css.mobileActionContainer}>
          <RenderWhen condition={isGroupOrder}>
            <div className={css.timeLeft}>{timeLeftText}</div>
            <div className={css.orderEndAt}>
              <div>
                {intl.formatMessage(
                  { id: 'EditView.OrderTitle.orderEndAt' },
                  {
                    deadline: (
                      <span className={css.orderEndAtTime}>
                        {formattedDeadlineDate}
                      </span>
                    ),
                  },
                )}
              </div>
              <IconEdit />
            </div>
          </RenderWhen>
          {actionButtons}
        </MobileBottomContainer>

        <RenderWhen.False>{actionButtons}</RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default OrderTitle;
