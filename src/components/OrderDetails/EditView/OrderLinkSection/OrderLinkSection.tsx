import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import IconShare from '@components/Icons/IconShare/IconShare';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import { getParticipantPickingLink } from '@helpers/order/prepareDataHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TUseBooleanReturns } from '@hooks/useBoolean';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
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
  shouldHideOnMobileView?: boolean;
  mobileModalControl?: TUseBooleanReturns;
};

const OrderLinkSection: React.FC<TOrderLinkSectionProps> = (props) => {
  const {
    rootClassName,
    className,
    data: { orderDeadline, companyName },
    ableToUpdateOrder,
    shouldHideOnMobileView = false,
    mobileModalControl,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { isMobileLayout } = useViewport();
  const sendNotificationModalControl = useBoolean();
  const orderData = useAppSelector((state) => state.OrderManagement.orderData);
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const isPicking =
    Listing(orderData as TListing).getMetadata().orderState ===
    EOrderStates.picking;

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

  const modalControl =
    mobileModalControl && isMobileLayout
      ? mobileModalControl
      : sendNotificationModalControl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderLink);
    setCopyToClipboardTooltip(copiedCopyText);
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

  const shouldShowSendNotificationModal =
    !inProgress && modalControl.value && isPicking;

  return (
    <div className={rootClasses}>
      <RenderWhen condition={!(shouldHideOnMobileView && isMobileLayout)}>
        <div className={css.titleContainer}>
          <div className={css.title}>{sectionTitle}</div>
          <Button
            variant="inline"
            disabled={!ableToUpdateOrder}
            className={css.shareLinkButton}
            onClick={sendNotificationModalControl.setTrue}>
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
      </RenderWhen>

      <SendNotificationModal
        onSubmit={handleSubmitSendNotification}
        data={{ orderLink, orderDeadline, companyName }}
        isOpen={shouldShowSendNotificationModal}
        onClose={modalControl.setFalse}
      />
    </div>
  );
};

export default OrderLinkSection;
