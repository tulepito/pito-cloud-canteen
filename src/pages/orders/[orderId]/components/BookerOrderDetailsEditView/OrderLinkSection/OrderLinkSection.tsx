import Button from '@components/Button/Button';
import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import IconShare from '@components/Icons/IconShare/IconShare';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TDefaultProps } from '@utils/types';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { orderManagementThunks } from '../../../OrderManagement.slice';
import css from './OrderLinkSection.module.scss';
import type { TSendNotificationFormValues } from './SendNotificationForm';
import SendNotificationModal from './SendNotificationModal';

type TOrderLinkSectionProps = TDefaultProps & {
  data: {
    orderDeadline: number;
  };
};

const OrderLinkSection: React.FC<TOrderLinkSectionProps> = (props) => {
  const {
    rootClassName,
    className,
    data: { orderDeadline },
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { orderData } = useAppSelector((state) => state.OrderManagement);
  const orderLink = `${process.env.NEXT_PUBLIC_CANONICAL_URL}/participant/order/${orderData?.id?.uuid}`;
  const formattedOrderDeadline = DateTime.fromMillis(orderDeadline).toFormat(
    'HH:mm EEE,dd/MM/yyyy',
    {
      locale: 'vi',
    },
  );
  const rootClasses = classNames(rootClassName || css.root, className);

  const defaultCopyText = useMemo(
    () =>
      intl.formatMessage({
        id: 'OrderLinkSection.copyToClipboardTooltip.default',
      }),
    [],
  );
  const copiedCopyText = useMemo(
    () =>
      intl.formatMessage({
        id: 'OrderLinkSection.copyToClipboardTooltip.copied',
      }),
    [],
  );

  const [copyToClipboardTooltip, setCopyToClipboardTooltip] =
    useState(defaultCopyText);
  const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] =
    useState(false);

  const sectionTitle = intl.formatMessage({
    id: 'OrderLinkSection.title',
  });
  const shareText = intl.formatMessage({
    id: 'OrderLinkSection.shareText',
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
      <div className={css.title}>{sectionTitle}</div>

      <div className={css.linkContainer}>
        <span>{orderLink}</span>
        <Tooltip tooltipContent={copyToClipboardTooltip} placement="bottom">
          <ButtonIcon onClick={handleCopyLink}>
            <IconCopy />
          </ButtonIcon>
        </Tooltip>
      </div>

      <Button
        variant="inline"
        className={css.shareLinkContainer}
        onClick={handleShareButtonClick}>
        <div className={css.shareLinkContent}>
          <IconShare className={css.editIcon} />
          <div>{shareText}</div>
        </div>
      </Button>

      <SendNotificationModal
        onSubmit={handleSubmitSendNotification}
        data={{ orderLink, orderDeadline }}
        isOpen={isSendNotificationModalOpen}
        onClose={handleCloseSendNotificationModal}
      />
    </div>
  );
};

export default OrderLinkSection;
