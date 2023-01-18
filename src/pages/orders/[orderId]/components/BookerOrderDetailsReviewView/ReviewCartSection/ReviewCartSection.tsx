import classNames from 'classnames';
import React from 'react';

import css from './ReviewCartSection.module.scss';

type TReviewCartSectionProps = { className?: string };

const ReviewCartSection: React.FC<TReviewCartSectionProps> = (props) => {
  const { className } = props;
  const rootClasses = classNames(css.root, className);

  return <div className={rootClasses}>ReviewCartSection</div>;
};

export default ReviewCartSection;
