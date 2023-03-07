import { ECompanyStates } from '@utils/enums';
import type { TCompany, TObject } from '@utils/types';

import type { TEditCompanyBankAccountsFormValues } from '../EditCompanyBankAccountsForm/EditCompanyBankAccountsForm';
import type { TEditCompanyInformationFormValues } from '../EditCompanyInformationForm/EditCompanyInformationForm';
import type { TEditCompanySettingsInformationFormValues } from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';

export const COMPANY_INFORMATION_TAB = 'information';
export const COMPANY_SETTINGS_TAB = 'settings';

export const EDIT_COMPANY_WIZARD_TABS = [
  COMPANY_INFORMATION_TAB,
  COMPANY_SETTINGS_TAB,
];

export const COMPANY_SETTING_INFORMATION_TAB_ID = 'companySettingsInformation';
export const COMPANY_SETTING_PAYMENT_TAB_ID = 'companySettingsPayment';
export const COMPANY_SETTING_SUBSCRIPTION_TAB_ID =
  'companySettingsSubscription';

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
};

export const createSubmitUpdateCompanyValues = (
  values: TEditCompanyInformationFormValues &
    TEditCompanySettingsInformationFormValues &
    TEditCompanyBankAccountsFormValues,
  tab: string,
) => {
  switch (tab) {
    case COMPANY_INFORMATION_TAB: {
      const { name, phoneNumber, location, note, tax } = values;
      const {
        selectedPlace: { address, origin },
      } = location || {};
      return {
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
    }
    case COMPANY_SETTINGS_TAB: {
      const {
        companyLogo = {},
        companyNutritions = [],
        tabValue,
        bankAccounts = [],
      } = values;
      switch (tabValue) {
        case COMPANY_SETTING_INFORMATION_TAB_ID: {
          const { imageId } = companyLogo || {};
          return {
            profileImageId: imageId?.uuid,
            publicData: {
              companyNutritions,
            },
          };
        }

        case COMPANY_SETTING_PAYMENT_TAB_ID: {
          return {
            privateData: { bankAccounts },
          };
        }
        case COMPANY_SETTING_SUBSCRIPTION_TAB_ID: {
          return {};
        }
        default:
          return {};
      }
    }
    default:
      return {};
  }
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

export const createSubmitAddMembersToCompanyValues = (values: TObject) => {
  const { userIdList = [], noAccountEmailList = [] } = values;
  return {
    userIdList,
    noAccountEmailList,
  };
};
