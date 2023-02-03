import Collapsible from '@components/Collapsible/Collapsible';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';

import type { TReviewInfoFormValues } from './ReviewInfoForm';
import ReviewInfoForm from './ReviewInfoForm';
import css from './ReviewInfoSection.module.scss';

type TReviewInfoSectionProps = {
  className?: string;
  data: {
    deliveryAddress: string;
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

  const {
    profile: { displayName, protectedData: { phoneNumber = '' } = {} },
  } = currentUser.attributes || {};

  const formInitialValues = {
    staffName,
    companyName,
    deliveryAddress,
    // deliveryAddress: {
    //   search: address,
    //   selectedPlace: { address, origin },
    // },
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
