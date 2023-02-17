import { ECompanyStates } from '@utils/enums';
import type { TCompany } from '@utils/types';

import type { TEditCompanyInformationFormValues } from '../EditCompanyInformationForm/EditCompanyInformationForm';
import type { TEditCompanySettingsInformationFormValues } from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';

export const COMPANY_INFORMATION_TAB = 'information';
export const COMPANY_SETTINGS_TAB = 'settings';

export const EDIT_COMPANY_WIZARD_TABS = [
  COMPANY_INFORMATION_TAB,
  COMPANY_SETTINGS_TAB,
];

export const createSubmitCreateCompanyValues = (
  values: TEditCompanyInformationFormValues &
    TEditCompanySettingsInformationFormValues,
  tab: string,
) => {
  const { name, email, password, phoneNumber, location, note, tax } = values;
  const {
    selectedPlace: { address, origin },
  } = location || {};

  switch (tab) {
    case COMPANY_INFORMATION_TAB:
      return {
        email,
        password,
        firstName: name,
        lastName: ' ',
        displayName: name,
        publicData: {
          phoneNumber,
          note,
          location: {
            address,
            origin: {
              lat: origin.lat,
              lng: origin.lng,
            },
          },
        },
        privateData: {
          tax,
        },
        metadata: {
          userState: ECompanyStates.draft,
        },
      };
    case COMPANY_SETTINGS_TAB:
      return {};
    default:
      return {};
  }

  return {};
};

export const createSubmitUpdateCompanyValues = (
  values: TEditCompanyInformationFormValues & TEditCompanySettingsFormValues,
  tab: string,
) => {
  const { name, phone, location, note, tax } = values;
  const {
    selectedPlace: { address, origin },
  } = location || {};

  switch (tab) {
    case COMPANY_INFORMATION_TAB:
      return {
        firstName: name,
        lastName: ' ',
        displayName: name,
        publicData: {
          phoneNumber: phone,
          note,
          location: {
            address,
            origin: {
              lat: origin.lat,
              lng: origin.lng,
            },
          },
        },
        privateData: {
          tax,
        },
        metadata: {
          userState: ECompanyStates.draft,
        },
      };
    case COMPANY_SETTINGS_TAB:
      return {};
    default:
      return {};
  }

  return {};
};

export const getInitialLocationValues = (company: TCompany) => {
  const { publicData = {} } = company.attributes.profile;
  const { location = {} } = publicData;
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
    : {};
};
