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
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { isOver } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import type { TDefaultProps, TObject } from '@utils/types';

import type { TEditOrderDeadlineFormValues } from '../OrderDeadlineCountdownSection/EditOrderDeadlineForm';
import EditOrderDeadlineModal from '../OrderDeadlineCountdownSection/EditOrderDeadlineModal';

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
    startDate: number;
  };
  onConfirmOrder: () => void;
  onCancelOrder: () => void;
  confirmButtonMessage?: string;
  cancelButtonMessage?: string;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
  confirmInProgress?: boolean;
  isDraftEditing: boolean;
  shouldHideBottomContainer?: boolean;
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
      startDate,
    },
    onConfirmOrder,
    onCancelOrder,
    confirmButtonMessage,
    cancelButtonMessage,
    cancelDisabled = false,
    confirmDisabled,
    confirmInProgress,
    isDraftEditing,
    shouldHideBottomContainer = false,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const editDeadlineModalControl = useBoolean();
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
  const isOverDeadline = isOver(deadlineDate);
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

  const handleSubmitEditDeadline = (values: TEditOrderDeadlineFormValues) => {
    const {
      deadlineDate: deadlineDateFromSubmission,
      deadlineHour: deadlineHourFromSubmission,
    } = values;
    const parsedDeadlineDate = DateTime.fromMillis(deadlineDateFromSubmission)
      .startOf('day')
      .plus({ ...convertHHmmStringToTimeParts(deadlineHourFromSubmission) })
      .toMillis();

    const updateData = {
      deadlineDate: parsedDeadlineDate,
      deadlineHour: deadlineHourFromSubmission,
    };

    dispatch(orderManagementThunks.updateOrderGeneralInfo(updateData));
    editDeadlineModalControl.setFalse();
  };

  const handleOpenEditDeadlineModal = () => {
    editDeadlineModalControl.setTrue();
  };

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
        <RenderWhen condition={!shouldHideBottomContainer}>
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
                <RenderWhen condition={!isOverDeadline}>
                  <IconEdit onClick={handleOpenEditDeadlineModal} />
                </RenderWhen>
              </div>

              <EditOrderDeadlineModal
                data={{
                  orderDeadline: deadlineDate,
                  orderStartDate: startDate,
                  orderDeadlineHour: deadlineHour,
                }}
                isOpen={editDeadlineModalControl.value}
                onClose={editDeadlineModalControl.setFalse}
                onSubmit={handleSubmitEditDeadline}
              />
            </RenderWhen>
            {actionButtons}
          </MobileBottomContainer>
        </RenderWhen>

        <RenderWhen.False>{actionButtons}</RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default OrderTitle;
