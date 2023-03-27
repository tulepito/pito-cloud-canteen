import { ECompanyStates } from '@utils/enums';
import type { TObject } from '@utils/types';

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
) => {
  const {
    firstName,
    lastName,
    companyName,
    companyEmail,
    companyLocation,
    email,
    password,
    phoneNumber,
    location,
    note,
    tax,
  } = values;
  const {
    selectedPlace: { address, origin },
  } = location || { selectedPlace: { origin: {} } };

  const {
    selectedPlace: { address: companyAddress, origin: companyOrigin },
  } = companyLocation || { selectedPlace: { origin: {} } };

  return {
    email,
    password,
    firstName,
    lastName,
    displayName: `${lastName} ${firstName}`,
    publicData: {
      companyName,
      companyEmail,
      phoneNumber,
      note,
      location: {
        address,
        origin: {
          lat: origin.lat,
          lng: origin.lng,
        },
      },
      companyLocation: {
        address: companyAddress,
        origin: {
          lat: companyOrigin.lat,
          lng: companyOrigin.lng,
        },
      },
    },
    privateData: {
      tax,
    },
  };
};

export const createSubmitUpdateCompanyValues = (
  values: TEditCompanyInformationFormValues &
    TEditCompanySettingsInformationFormValues &
    TEditCompanyBankAccountsFormValues,
  tab: string,
) => {
  switch (tab) {
    case COMPANY_INFORMATION_TAB: {
      const {
        firstName,
        lastName,
        companyEmail,
        companyLocation,
        companyName,
        phoneNumber,
        location,
        note,
        tax,
      } = values;
      const {
        selectedPlace: { address, origin },
      } = location || { selectedPlace: { origin: {} } };

      const {
        selectedPlace: { address: companyAddress, origin: companyOrigin },
      } = companyLocation || { selectedPlace: { origin: {} } };

      return {
        firstName,
        lastName,
        displayName: `${lastName} ${firstName}`,
        publicData: {
          phoneNumber,
          companyEmail,
          companyName,
          note,
          location: {
            address,
            origin: {
              lat: origin.lat,
              lng: origin.lng,
            },
          },
          companyLocation: {
            address: companyAddress,
            origin: {
              lat: companyOrigin.lat,
              lng: companyOrigin.lng,
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
        nutritions = [],
        tabValue,
        bankAccounts = [],
        paymentDueDays,
      } = values;
      switch (tabValue) {
        case COMPANY_SETTING_INFORMATION_TAB_ID: {
          const { imageId } = companyLogo || {};

          return {
            profileImageId: imageId?.uuid,
            publicData: {
              nutritions,
            },
          };
        }

        case COMPANY_SETTING_PAYMENT_TAB_ID: {
          return {
            privateData: { bankAccounts, paymentDueDays },
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

export const createSubmitAddMembersToCompanyValues = (values: TObject) => {
  const { userIdList = [], noAccountEmailList = [] } = values;

  return {
    userIdList,
    noAccountEmailList,
  };
};
