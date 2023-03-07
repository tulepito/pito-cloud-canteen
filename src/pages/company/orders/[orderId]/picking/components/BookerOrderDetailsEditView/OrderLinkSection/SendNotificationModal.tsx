import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import { formatTimestamp } from '@utils/dates';

import type { TSendNotificationFormValues } from './SendNotificationForm';
import SendNotificationForm from './SendNotificationForm';

import css from './SendNotificationModal.module.scss';

type SendNotificationModalProps = {
  isOpen: boolean;
  isFirstTimeShow: boolean;
  data: { orderLink: string; orderDeadline: number; companyName: string };
  onClose: () => void;
  onSubmit: (values: TSendNotificationFormValues) => void;
};

const SendNotificationModal: React.FC<SendNotificationModalProps> = (props) => {
  const intl = useIntl();
  const {
    onClose,
    isOpen,
    isFirstTimeShow,
    data: { orderDeadline, orderLink, companyName },
    onSubmit,
  } = props;

  const defaultCopyText = intl.formatMessage({
    id: 'SendNotificationModal.copyToClipboardTooltip.default',
  });
  const copiedCopyText = intl.formatMessage({
    id: 'SendNotificationModal.copyToClipboardTooltip.copied',
  });

  const [copyToClipboardTooltip, setCopyToClipboardTooltip] =
    useState(defaultCopyText);

  const sendNotificationModalTitle = (
    <span className={css.title}>
      {isFirstTimeShow
        ? intl.formatMessage({
            id: 'SendNotificationModal.firstTimeTitle',
          })
        : intl.formatMessage({ id: 'SendNotificationModal.title' })}
    </span>
  );
  const sendNotificationModalAlert = intl.formatMessage(
    {
      id: 'SendNotificationModal.alert',
    },
    {
      dateTime: formatTimestamp(orderDeadline, 'dd/MM/yyyy  HH:mm'),
    },
  );
  const sendNotificationModalLinkLabel = isFirstTimeShow
    ? intl.formatMessage({
        id: 'SendNotificationModal.firstTimeLinkLabel',
      })
    : intl.formatMessage({
        id: 'SendNotificationModal.linkLabel',
      });
  const sendNotificationModalDescriptionLabel = intl.formatMessage({
    id: 'SendNotificationModal.descriptionLabel',
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderLink);
    setCopyToClipboardTooltip(copiedCopyText);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={sendNotificationModalTitle}
      handleClose={onClose}>
      <div>
        <RenderWhen condition={isFirstTimeShow}>
          <div className={css.infoContainer}>
            <div className={css.infoRow}>
              <div>
                {intl.formatMessage({
                  id: 'SendNotificationModal.info.companyTitle',
                })}
              </div>
              <div title={companyName}>{companyName}</div>
            </div>
          </div>
        </RenderWhen>
        <div className={css.alertContainer}>{sendNotificationModalAlert}</div>
        <RenderWhen condition={isFirstTimeShow}>
          <div className={css.divider} />
        </RenderWhen>
        <div>
          <div className={css.linkLabel}>{sendNotificationModalLinkLabel}</div>
          <div className={css.linkContainer}>
            <span>{orderLink}</span>
            <Tooltip tooltipContent={copyToClipboardTooltip} placement="bottom">
              <ButtonIcon onClick={handleCopyLink}>
                <IconCopy />
              </ButtonIcon>
            </Tooltip>
          </div>
        </div>
        <div className={css.descriptionContainer}>
          <div className={css.prefix} />
          <div className={css.descriptionLabel}>
            {sendNotificationModalDescriptionLabel}
          </div>
        </div>
        <SendNotificationForm onSubmit={onSubmit} />
      </div>
    </Modal>
  );
};

export default SendNotificationModal;
