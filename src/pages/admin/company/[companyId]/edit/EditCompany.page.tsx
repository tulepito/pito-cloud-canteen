import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearError,
  updateCompanyPageThunks,
} from '@redux/slices/EditCompanyPage.slice';
import type { TCompany } from '@utils/types';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import type { TEditCompanyFormValues } from '../../components/EditCompanyForm/EditCompanyForm';
import EditCompanyForm from '../../components/EditCompanyForm/EditCompanyForm';
import css from './EditCompany.module.scss';

const getInitialLocationValues = (company: TCompany) => {
  const { publicData = {} } = company.attributes.profile || {};

  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent =
    publicData &&
    publicData.location &&
    publicData.location.address &&
    publicData.location.origin;

  const { address, origin } = publicData.location || {};

  return locationFieldsPresent
    ? {
        search: address,
        selectedPlace: { address, origin },
      }
    : null;
};

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
    const { companyName, companyEmail, companyAddress, phoneNumber, note } =
      profile.publicData;
    const { tax } = profile.privateData;
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      phone: phoneNumber,
      companyName,
      companyEmail,
      companyAddress,
      tax,
      note,
      location: { ...getInitialLocationValues(company) },
    };
  }, [company]) as TEditCompanyFormValues;

  const onSubmit = (values: TEditCompanyFormValues) => {
    const { location } = values;
    const {
      selectedPlace: { address, origin },
    } = location || {};
    const companyData = {
      id: company.id.uuid,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: `${values.lastName} ${values.firstName}`,
      publicData: {
        companyAddress: values.companyAddress,
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
      updateCompanyPageThunks.updateCompany({
        dataParams: companyData,
        queryParams: { expand: true },
      }),
    );
  };

  const formErrorMessage = updateCompanyError
    ? intl.formatMessage({ id: 'EditCompanyPage.updateCompanyFailed' })
    : null;

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [clearError, dispatch]);

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
