import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';

import css from './ReviewTitleSection.module.scss';

type TReviewTitleSectionProps = {
  className?: string;
  orderTitle: string;
  onGoBack: () => void;
};

const ReviewTitleSection: React.FC<TReviewTitleSectionProps> = (props) => {
  const { className, onGoBack, orderTitle } = props;
  const intl = useIntl();
  const rootClasses = classNames(css.root, className);

  return (
    <div className={rootClasses}>
      <Button variant="inline" className={css.goBackButton} onClick={onGoBack}>
        <IconArrow direction="left" />
        {intl.formatMessage({ id: 'ReviewTitleSection.goBackText' })}
      </Button>
      <div className={css.title}>
        {intl.formatMessage({ id: 'ReviewTitleSection.title' }, { orderTitle })}
      </div>
      <div className={css.mobileTitle}>
        {intl.formatMessage(
          { id: 'ReviewTitleSection.mobileTitle' },
          { orderTitle },
        )}
      </div>
    </div>
  );
};

export default ReviewTitleSection;
