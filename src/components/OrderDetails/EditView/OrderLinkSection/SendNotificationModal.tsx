import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tooltip from '@components/Tooltip/Tooltip';
import { useViewport } from '@hooks/useViewport';
import { formatTimestamp } from '@utils/dates';

import type { TSendNotificationFormValues } from './SendNotificationForm';
import SendNotificationForm from './SendNotificationForm';

import css from './SendNotificationModal.module.scss';

type SendNotificationModalProps = {
  isOpen: boolean;
  data: { orderLink: string; orderDeadline: number; companyName: string };
  onClose: () => void;
  onSubmit: (values: TSendNotificationFormValues) => void;
};

const SendNotificationModal: React.FC<SendNotificationModalProps> = (props) => {
  const intl = useIntl();
  const {
    onClose,
    isOpen,
    data: { orderDeadline, orderLink },
    onSubmit,
  } = props;
  const { isMobileLayout } = useViewport();

  const defaultCopyText = intl.formatMessage({
    id: 'SendNotificationModal.copyToClipboardTooltip.default',
  });
  const copiedCopyText = intl.formatMessage({
    id: 'SendNotificationModal.copyToClipboardTooltip.copied',
  });

  const [copyToClipboardTooltip, setCopyToClipboardTooltip] =
    useState(defaultCopyText);

  const modalTitle = (
    <span className={css.title}>
      {intl.formatMessage({ id: 'SendNotificationModal.title' })}
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
  const sendNotificationModalLinkLabel = intl.formatMessage({
    id: 'SendNotificationModal.linkLabel',
  });
  const sendNotificationModalDescriptionLabel = intl.formatMessage({
    id: 'SendNotificationModal.descriptionLabel',
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderLink);
    setCopyToClipboardTooltip(copiedCopyText);
  };

  const content = (
    <>
      <div className={css.alertContainer}>{sendNotificationModalAlert}</div>
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
    </>
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <SlideModal
        id="SendNotificationModal"
        modalTitle={modalTitle}
        onClose={onClose}
        isOpen={isOpen}>
        {content}
      </SlideModal>

      <RenderWhen.False>
        <Modal isOpen={isOpen} title={modalTitle} handleClose={onClose}>
          {content}
        </Modal>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SendNotificationModal;
