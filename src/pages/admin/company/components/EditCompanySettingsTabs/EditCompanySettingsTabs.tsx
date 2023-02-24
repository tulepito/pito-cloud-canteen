import Tabs from '@components/Tabs/Tabs';
import type {
  TCompany,
  TCompanyMemberWithDetails,
  TImage,
  TObject,
} from '@utils/types';
import React from 'react';
import type { FormProps } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import type { TAddCompanyGroupsFormValues } from '../AddCompanyGroupsForm/AddCompanyGroupsForm';
import EditCompanyBankAccountsForm from '../EditCompanyBankAccountsForm/EditCompanyBankAccountsForm';
import type { TEditCompanySettingsInformationFormValues } from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';
import EditCompanySettingsInformationForm from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';
import {
  COMPANY_SETTING_INFORMATION_TAB_ID,
  COMPANY_SETTING_PAYMENT_TAB_ID,
  COMPANY_SETTING_SUBSCRIPTION_TAB_ID,
} from '../EditCompanyWizard/utils';
import type { TUpdateCompanyGroupFormValues } from '../UpdateCompanyGroupForm/UpdateCompanyGroupForm';
import css from './EditCompanySettingsTabs.module.scss';

type TExtraProps = {
  formRef: any;
  onCompanyLogoUpload: (params: { id: string; file: File }) => any;
  onRemoveCompanyLogo: () => void;
  uploadCompanyLogoError: any;
  uploadedCompanyLogo: TImage | null | { id: string; file: File };
  uploadingCompanyLogo: boolean;
  companyMembers: TCompanyMemberWithDetails[];
  company: TCompany;
  onAddMembersToCompany: (values: TObject) => void;
  onAddGroupToCompany: (values: TAddCompanyGroupsFormValues) => void;
  addMembersInProgress: boolean;
  addMembersError: any;
  createGroupInProgress: boolean;
  createGroupError: any;
  onUpdateGroup: (values: TUpdateCompanyGroupFormValues) => void;
  updateGroupInProgress: boolean;
  updateGroupError: any;
  deleteMemberInProgress: boolean;
  deleteMemberError: any;
  onRemoveMember: (email: string) => void;
  onRemoveGroup: (groupId: string) => void;
  deleteGroupInProgress: boolean;
  deleteGroupError: any;
  onUpdateMemberPermission: (params: {
    memberEmail: string;
    permission: string;
  }) => void;
};

type TEditCompanySettingsTabsProps =
  FormProps<TEditCompanySettingsInformationFormValues> & TExtraProps;

const EditCompanySettingsTabs: React.FC<TEditCompanySettingsTabsProps> = (
  props,
) => {
  const menuContent = [
    {
      id: COMPANY_SETTING_INFORMATION_TAB_ID,
      label: (
        <FormattedMessage id="EditCompanySettingsTabs.informationSetting" />
      ),
      children: <EditCompanySettingsInformationForm {...props} />,
    },
    {
      id: COMPANY_SETTING_PAYMENT_TAB_ID,
      label: <FormattedMessage id="EditCompanySettingsTabs.paymentSetting" />,
      children: <EditCompanyBankAccountsForm {...props} />,
    },
    {
      id: COMPANY_SETTING_SUBSCRIPTION_TAB_ID,
      label: (
        <FormattedMessage id="EditCompanySettingsTabs.subscriptionSetting" />
      ),
      children: <></>,
    },
  ];
  return <Tabs className={css.root} items={menuContent as any} />;
};

export default EditCompanySettingsTabs;
