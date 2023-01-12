import Button from '@components/Button/Button';
import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import IconShare from '@components/Icons/IconShare/IconShare';
import Tooltip from '@components/Tooltip/Tooltip';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import css from './BookerOrderDetailsOrderLinkSection.module.scss';
import SendNotificationModal from './SendNotificationModal';

type BookerOrderDetailsOrderLinkSectionProps = {
  rootClassName?: string;
  className?: string;
};

const BookerOrderDetailsOrderLinkSection: React.FC<
  BookerOrderDetailsOrderLinkSectionProps
> = (props) => {
  const intl = useIntl();
  const orderLink = 'https://app-test.pito.vn/AOaemvKULgst0cvmSuhO7XCj6EL_ds';
  const defaultCopyText = useMemo(
    () =>
      intl.formatMessage({
        id: 'BookerOrderDetailsOrderLinkSection.copyToClipboardTooltip.default',
      }),
    [],
  );
  const copiedCopyText = useMemo(
    () =>
      intl.formatMessage({
        id: 'BookerOrderDetailsOrderLinkSection.copyToClipboardTooltip.copied',
      }),
    [],
  );

  const [copyToClipboardTooltip, setCopyToClipboardTooltip] =
    useState(defaultCopyText);
  const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] =
    useState(false);

  const { rootClassName, className } = props;
  const rootClasses = classNames(rootClassName || css.root, className);

  const sectionTitle = intl.formatMessage({
    id: 'BookerOrderDetailsOrderLinkSection.title',
  });
  const shareText = intl.formatMessage({
    id: 'BookerOrderDetailsOrderLinkSection.shareText',
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
        orderLink={orderLink}
        isOpen={isSendNotificationModalOpen}
        onClose={handleCloseSendNotificationModal}
      />
    </div>
  );
};

export default BookerOrderDetailsOrderLinkSection;
