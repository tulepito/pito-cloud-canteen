import Collapsible from '@components/Collapsible/Collapsible';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
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
    reviewInfoValues?: TReviewInfoFormValues;
  };
  onSubmit: (values: TReviewInfoFormValues) => void;

  startSubmitReviewInfoForm: boolean;
};

const ReviewInfoSection: React.FC<TReviewInfoSectionProps> = (props) => {
  const {
    className,
    data: {
      deliveryAddress,
      staffName = '',
      companyName = '',
      reviewInfoValues,
    },
    onSubmit,
    startSubmitReviewInfoForm,
  } = props;
  const intl = useIntl();
  const currentUser = useAppSelector(currentUserSelector);

  const rootClasses = classNames(css.root, className);

  const { address, origin } = deliveryAddress || {};
  const {
    profile: { displayName, protectedData: { phoneNumber = '' } = {} },
  } = currentUser.attributes || {};

  const formInitialValues = {
    staffName,
    companyName,
    deliveryAddress: {
      search: address,
      selectedPlace: { address, origin },
    },
    contactPeopleName: displayName,
    contactPhoneNumber: phoneNumber,
    ...(reviewInfoValues ? { ...reviewInfoValues } : {}),
  };

  return (
    <Collapsible
      label={intl.formatMessage({ id: 'ReviewInfoSection.title' })}
      className={rootClasses}>
      <ReviewInfoForm
        startSubmit={startSubmitReviewInfoForm}
        onSubmit={onSubmit}
        initialValues={formInitialValues}
      />
    </Collapsible>
  );
};

export default ReviewInfoSection;
