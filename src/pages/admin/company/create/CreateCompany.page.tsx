import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearError,
  createCompanyPageThunks,
} from '@redux/slices/CreateCompanyPage.slice';
import { isSignUpEmailTakenError } from '@utils/errors';

import type { TEditCompanyFormValues } from '../components/EditCompanyForm/EditCompanyForm';
import EditCompanyForm from '../components/EditCompanyForm/EditCompanyForm';

import css from './CreateCompany.module.scss';

export default function CreateCompanyPage() {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { createCompanyInProgress, createCompanyError } = useAppSelector(
    (state) => state.CreateCompanyPage,
  );

  const onSubmit = async (values: TEditCompanyFormValues) => {
    const { location, companyLocation } = values;
    const {
      selectedPlace: { address, origin },
    } = location || {};

    const {
      selectedPlace: { address: companyAddress, origin: companyOrigin },
    } = companyLocation || {};

    const companyData = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: `${values.lastName} ${values.firstName}`,
      publicData: {
        companyLocation: {
          address: companyAddress,
          origin: {
            lat: companyOrigin.lat,
            lng: companyOrigin.lng,
          },
        },
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        phoneNumber: values.phone,
        note: values.note,
        location: {
          address,
          origin: {
            lat: origin.lat,
            lng: origin.lng,
          },
        },
      },
      privateData: {
        tax: values.tax,
      },
    };

    return dispatch(
      createCompanyPageThunks.createCompany({
        dataParams: companyData,
        queryParams: { expand: true },
      }),
    );
  };

  const formErrorMessage = isSignUpEmailTakenError(createCompanyError)
    ? intl.formatMessage({
        id: 'CreateCompanyPage.createCompanyEmailAlreadyTaken',
      })
    : intl.formatMessage({
        id: 'CreateCompanyPage.createCompanyFailed',
      });

  useEffect(() => {
    dispatch(clearError());

    return () => {
      dispatch(clearError());
    };
  }, [clearError, dispatch]);

  return (
    <div className={css.root}>
      <EditCompanyForm
        onSubmit={onSubmit}
        inProgress={createCompanyInProgress}
        formErrorMessage={createCompanyError ? formErrorMessage : null}
      />
    </div>
  );
}
