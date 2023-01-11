import Button from '@components/Button/Button';
import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import IconShare from '@components/Icons/IconShare/IconShare';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './BookerOrderDetailsOrderLinkSection.module.scss';

type BookerOrderDetailsOrderLinkSectionProps = {
  rootClassName?: string;
  className?: string;
};

const BookerOrderDetailsOrderLinkSection: React.FC<
  BookerOrderDetailsOrderLinkSectionProps
> = (props) => {
  const intl = useIntl();

  const { rootClassName, className } = props;
  const rootClasses = classNames(rootClassName || css.root, className);

  const sectionTitle = intl.formatMessage({
    id: 'BookerOrderDetailsOrderLinkSection.title',
  });

  const shareText = intl.formatMessage({
    id: 'BookerOrderDetailsOrderLinkSection.shareText',
  });

  return (
    <div className={rootClasses}>
      <div className={css.title}>{sectionTitle}</div>

      <div className={css.linkContainer}>
        <span>https://app-test.pito.v...</span>
        <ButtonIcon>
          <IconCopy />
        </ButtonIcon>
      </div>

      <Button variant="inline" className={css.shareLinkContainer}>
        <div className={css.shareLinkContent}>
          <IconShare className={css.editIcon} />
          <div>{shareText}</div>
        </div>
      </Button>
    </div>
  );
};

export default BookerOrderDetailsOrderLinkSection;
