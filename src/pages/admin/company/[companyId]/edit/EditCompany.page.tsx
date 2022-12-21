import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { updateCompanyPageThunks } from '@redux/slices/EditCompanyPage.slice';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import type { TEditCompanyFormValues } from '../../components/EditCompanyForm/EditCompanyForm';
import EditCompanyForm from '../../components/EditCompanyForm/EditCompanyForm';
import css from './EditCompany.module.scss';

export default function EditCompanyPage() {
  const intl = useIntl();
  const router = useRouter();
  const { query } = router;
  const { companyId } = query;

  const dispatch = useAppDispatch();

  const {
    showCompanyInProgress,
    companyRef: company,
    updateCompanyInProgress,
    updateCompanyError,
    showCompanyError,
  } = useAppSelector((state) => state.EditCompanyPage);

  useEffect(() => {
    if (!companyId) return;
    dispatch(updateCompanyPageThunks.showCompany(companyId as string));
  }, [companyId]);

  const initialValues = useMemo(() => {
    if (!company) {
      return {};
    }
    const { profile, email } = company.attributes;
    const {
      address,
      companyName,
      companyEmail,
      companyAddress,
      phoneNumber,
      note,
    } = profile.publicData;
    const { tax } = profile.privateData;
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      phone: phoneNumber,
      address,
      companyName,
      companyEmail,
      companyAddress,
      tax,
      note,
    };
  }, [company]) as TEditCompanyFormValues;

  const onSubmit = (values: TEditCompanyFormValues) => {
    const companyData = {
      id: company.id.uuid,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: `${values.firstName} ${values.lastName}`,
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
    dispatch(
      updateCompanyPageThunks.updateCompany({
        dataParams: companyData,
        queryParams: { expand: true },
      }),
    );
  };

  const formErrorMessage = updateCompanyError
    ? intl.formatMessage({ id: 'EditCompanyPage.updateCompanyFailed' })
    : null;

  return (
    <div className={css.root}>
      {showCompanyInProgress ? (
        <div className={css.loadingContainer}>
          <IconSpinner className={css.spinner} />
        </div>
      ) : (
        <EditCompanyForm
          onSubmit={onSubmit}
          initialValues={initialValues}
          inProgress={updateCompanyInProgress}
          formErrorMessage={formErrorMessage}
          isEditting={true}
        />
      )}
      {showCompanyError && <ErrorMessage message={showCompanyError.message} />}
    </div>
  );
}
