import Collapsible from '@components/Collapsible/Collapsible';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';

import type { TReviewInfoFormValues } from './ReviewInfoForm';
import ReviewInfoForm from './ReviewInfoForm';
import css from './ReviewInfoSection.module.scss';

type TReviewInfoSectionProps = {
  className?: string;
  data: {
    deliveryAddress: TObject;
    staffName: string;
    companyName: string;
  };
  onSubmit: (values: TReviewInfoFormValues) => void;
};

const ReviewInfoSection: React.FC<TReviewInfoSectionProps> = (props) => {
  const {
    className,
    data: { deliveryAddress, staffName = '', companyName = '' },
    onSubmit,
  } = props;
  const { address, origin } = deliveryAddress || {};
  const intl = useIntl();
  const rootClasses = classNames(css.root, className);

  const formInitialValues = {
    staffName,
    companyName,
    deliveryAddress: {
      search: address,
      selectedPlace: { address, origin },
    },
  };

  return (
    <Collapsible
      label={intl.formatMessage({ id: 'ReviewInfoSection.title' })}
      className={rootClasses}>
      <ReviewInfoForm onSubmit={onSubmit} initialValues={formInitialValues} />
    </Collapsible>
  );
};

export default ReviewInfoSection;
