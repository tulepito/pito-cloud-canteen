import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearError,
  updateCompanyPageThunks,
} from '@redux/slices/EditCompanyPage.slice';

import type { TEditCompanyFormValues } from '../../components/EditCompanyForm/EditCompanyForm';
import EditCompanyForm from '../../components/EditCompanyForm/EditCompanyForm';

import css from './EditCompany.module.scss';

const getInitialLocationValues = (location: any) => {
  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent = location && location.address && location.origin;

  const { address, origin } = location || {};

  return locationFieldsPresent
    ? {
        predictions: [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const initialValues = useMemo(() => {
    if (!company) {
      return {};
    }
    const { profile, email } = company.attributes;
    const {
      companyName,
      companyEmail,
      companyLocation,
      phoneNumber,
      note,
      location,
    } = profile.publicData;
    const { tax } = profile.privateData;

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      phone: phoneNumber,
      companyName,
      companyEmail,
      companyLocation: getInitialLocationValues(companyLocation),
      tax,
      note,
      location: getInitialLocationValues(location),
    };
  }, [company]) as TEditCompanyFormValues;

  const onSubmit = (values: TEditCompanyFormValues) => {
    const { location, companyLocation } = values;
    const {
      selectedPlace: { address, origin },
    } = location || {};

    const {
      selectedPlace: { address: companyAddress, origin: companyOrigin },
    } = companyLocation || {};

    const companyData = {
      id: company.id.uuid,
      firstName: String(values.firstName).trim(),
      lastName: String(values.lastName).trim(),
      displayName: `${String(values.lastName).trim()} ${String(
        values.firstName,
      ).trim()}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
