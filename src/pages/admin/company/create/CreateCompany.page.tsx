import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearError,
  createCompanyPageThunks,
} from '@redux/slices/CreateCompanyPage.slice';
import { isSignupEmailTakenError } from '@utils/errors';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

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
    const companyData = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: `${values.lastName} ${values.firstName}`,
      publicData: {
        address: values.address,
        companyAddress: values.companyAddress,
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        phoneNumber: values.phone,
        note: values.note,
      },
      privateData: {
        tax: values.tax,
      },
    };
    await dispatch(
      createCompanyPageThunks.createCompany({
        dataParams: companyData,
        queryParams: { expand: true },
      }),
    );
  };

  const formErrorMessage = isSignupEmailTakenError(createCompanyError)
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
  console.log(createCompanyError);
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
