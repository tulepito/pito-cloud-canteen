import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import type { TObject } from '@utils/types';

import ReviewOrdersResultModal from './ReviewOrdersResultModal';

import css from './ReviewOrdersResultSection.module.scss';

type TReviewOrdersResultSectionProps = {
  className?: string;
  onDownloadReviewOrderResults: () => void;
  data: TObject;
};

const ReviewOrdersResultSection: React.FC<TReviewOrdersResultSectionProps> = (
  props,
) => {
  const { className, onDownloadReviewOrderResults, data } = props;
  const intl = useIntl();
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const { participants } = data;

  const rootClasses = classNames(css.root, className);

  const handleClickButtonViewResult = () => {
    setIsResultModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsResultModalOpen(false);
  };

  if (!participants.length) return null;

  return (
    <div className={rootClasses}>
      <div className={css.titleContainer}>
        <div className={css.title}>
          {intl.formatMessage({ id: 'ReviewOrdersResultSection.title' })}
        </div>
      </div>
      <Button
        variant="inline"
        type="button"
        className={css.viewResultButton}
        onClick={handleClickButtonViewResult}>
        {intl.formatMessage({
          id: 'ReviewOrdersResultSection.viewResultText',
        })}
      </Button>
      <ReviewOrdersResultModal
        data={data}
        onDownloadReviewOrderResults={onDownloadReviewOrderResults}
        isOpen={isResultModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ReviewOrdersResultSection;
