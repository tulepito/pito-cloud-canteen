import Tabs from '@components/Tabs/Tabs';
import type { TCompany, TCompanyMemberWithDetails, TImage } from '@utils/types';
import type { FormApi } from 'final-form';
import type { MutableRefObject } from 'react';
import React from 'react';
import type { FormProps } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import type { TEditCompanyInformationFormValues } from '../EditCompanyInformationForm/EditCompanyInformationForm';
import type { TEditCompanySettingsInformationFormValues } from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';
import EditCompanySettingsInformationForm from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';
import css from './EditCompanySettingsTabs.module.scss';

type TExtraProps = {
  formRef: MutableRefObject<
    FormApi<
      TEditCompanyInformationFormValues,
      Partial<TEditCompanySettingsInformationFormValues>
    >
  >;
  onCompanyLogoUpload: (params: { id: string; file: File }) => any;
  onRemoveCompanyLogo: () => void;
  uploadCompanyLogoError: any;
  uploadedCompanyLogo: TImage | null | { id: string; file: File };
  uploadingCompanyLogo: boolean;
  companyMembers: TCompanyMemberWithDetails[];
  company: TCompany;
};

type TEditCompanySettingsTabsProps =
  FormProps<TEditCompanySettingsInformationFormValues> & TExtraProps;

const EditCompanySettingsTabs: React.FC<TEditCompanySettingsTabsProps> = (
  props,
) => {
  const menuContent = [
    {
      id: 'companySettingsInformation',
      label: (
        <FormattedMessage id="EditCompanySettingsTabs.informationSetting" />
      ),
      children: <EditCompanySettingsInformationForm {...props} />,
    },
    {
      id: 'companySettingsPayment',
      label: <FormattedMessage id="EditCompanySettingsTabs.paymentSetting" />,
      children: <EditCompanySettingsInformationForm {...props} />,
    },
    {
      id: 'companySettingsSubscription',
      label: (
        <FormattedMessage id="EditCompanySettingsTabs.subscriptionSetting" />
      ),
      children: <EditCompanySettingsInformationForm {...props} />,
    },
  ];
  return <Tabs className={css.root} items={menuContent as any} />;
};

export default EditCompanySettingsTabs;
