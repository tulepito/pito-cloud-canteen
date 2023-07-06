import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import IconShare from '@components/Icons/IconShare/IconShare';
import Tooltip from '@components/Tooltip/Tooltip';
import { getParticipantPickingLink } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import { EOrderStates } from '@src/utils/enums';
import { formatTimestamp } from '@utils/dates';
import type { TDefaultProps, TListing } from '@utils/types';

import type { TSendNotificationFormValues } from './SendNotificationForm';
import SendNotificationModal from './SendNotificationModal';

import css from './OrderLinkSection.module.scss';

type TOrderLinkSectionProps = TDefaultProps & {
  data: {
    orderDeadline: number;
    companyName: string;
  };
  isAminLayout?: boolean;
  ableToUpdateOrder: boolean;
};

const OrderLinkSection: React.FC<TOrderLinkSectionProps> = (props) => {
  const {
    rootClassName,
    className,
    data: { orderDeadline, companyName },
    isAminLayout = false,
    ableToUpdateOrder,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const orderData = useAppSelector((state) => state.OrderManagement.orderData);
  const planData = useAppSelector((state) => state.OrderManagement.planData);
  const planViewed = useAppSelector(
    (state) => state.OrderManagement.planViewed,
  );
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] =
    useState(false);

  const plan = Listing(planData as TListing);
  const order = Listing(orderData as TListing);
  const { orderState } = order.getMetadata();

  const { viewed } = plan.getMetadata();
  const orderId = order.getId();
  const planId = plan.getId();

  const isPicking = orderState === EOrderStates.picking;
  const isFirstTimeAccess =
    !isAminLayout && !(inProgress || viewed || planViewed);

  const orderLink = getParticipantPickingLink(orderData?.id?.uuid);
  const formattedOrderDeadline = formatTimestamp(
    orderDeadline,
    'HH:mm EEE,dd/MM/yyyy',
  );
  const rootClasses = classNames(rootClassName || css.root, className);

  const defaultCopyText = intl.formatMessage({
    id: 'OrderLinkSection.copyToClipboardTooltip.default',
  });
  const copiedCopyText = intl.formatMessage({
    id: 'OrderLinkSection.copyToClipboardTooltip.copied',
  });

  const [copyToClipboardTooltip, setCopyToClipboardTooltip] =
    useState(defaultCopyText);

  const sectionTitle = intl.formatMessage({
    id: 'OrderLinkSection.title',
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderLink);
    setCopyToClipboardTooltip(copiedCopyText);
  };

  const handleShareButtonClick = () => {
    setIsSendNotificationModalOpen(true);
  };
  const handleCloseSendNotificationModal = () => {
    setIsSendNotificationModalOpen(false);

    if (!viewed && planId && orderId) {
      dispatch(
        orderManagementThunks.bookerMarkInprogressPlanViewed({
          planId,
          orderId,
        }),
      );
    }
  };

  const handleSubmitSendNotification = async (
    values: TSendNotificationFormValues,
  ) => {
    const emailParams = {
      ...values,
      orderLink,
      deadline: formattedOrderDeadline,
    };

    dispatch(orderManagementThunks.sendRemindEmailToMember(emailParams));
  };

  return (
    <div className={rootClasses}>
      <div className={css.titleContainer}>
        <div className={css.title}>{sectionTitle}</div>
        <Button
          variant="inline"
          disabled={!ableToUpdateOrder}
          className={css.shareLinkButton}
          onClick={handleShareButtonClick}>
          <IconShare className={css.editIcon} />
        </Button>
      </div>

      <div className={css.linkContainer}>
        <span>{orderLink}</span>
        <Tooltip
          overlayClassName={css.toolTipOverlay}
          tooltipContent={copyToClipboardTooltip}
          placement="bottom">
          <ButtonIcon disabled={!ableToUpdateOrder} onClick={handleCopyLink}>
            <IconCopy />
          </ButtonIcon>
        </Tooltip>
      </div>

      <SendNotificationModal
        onSubmit={handleSubmitSendNotification}
        data={{ orderLink, orderDeadline, companyName }}
        isFirstTimeShow={isFirstTimeAccess}
        isOpen={
          !inProgress &&
          (isFirstTimeAccess || isSendNotificationModalOpen) &&
          isPicking
        }
        onClose={handleCloseSendNotificationModal}
      />
    </div>
  );
};

export default OrderLinkSection;
