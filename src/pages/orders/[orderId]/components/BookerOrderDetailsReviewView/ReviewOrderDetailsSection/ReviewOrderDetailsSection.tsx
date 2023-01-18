import classNames from 'classnames';
import React from 'react';

import css from './ReviewOrderDetailsSection.module.scss';

type TReviewOrderDetailsSectionProps = { className?: string };

const ReviewOrderDetailsSection: React.FC<TReviewOrderDetailsSectionProps> = (
  props,
) => {
  const { className } = props;
  const rootClasses = classNames(css.root, className);

  return <div className={rootClasses}>ReviewOrderDetailsSection</div>;
};

export default ReviewOrderDetailsSection;
