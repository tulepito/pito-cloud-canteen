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
  };
  onSubmit: (values: TReviewInfoFormValues) => void;
};

const ReviewInfoSection: React.FC<TReviewInfoSectionProps> = (props) => {
  const {
    className,
    data: { deliveryAddress, staffName = '', companyName = '' },
    onSubmit,
  } = props;
  const intl = useIntl();
  const currentUser = useAppSelector(currentUserSelector);

  const rootClasses = classNames(css.root, className);

  const { address, origin } = deliveryAddress || {};
  console.log(currentUser.attributes);

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
