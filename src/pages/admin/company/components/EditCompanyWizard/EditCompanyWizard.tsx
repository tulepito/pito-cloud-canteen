import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import type { TFormTabChildrenProps } from '@components/FormWizard/FormTabs/FormTabs';
import FormWizard from '@components/FormWizard/FormWizard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useRedirectTabWizard from '@hooks/useRedirectTabWizard';
import { companySlice, companyThunks } from '@redux/slices/company.slice';
import { companyMemberThunks } from '@redux/slices/companyMember.slice';
import { adminRoutes } from '@src/paths';
import { User } from '@utils/data';
import { ECompanyStates } from '@utils/enums';
import { isSignUpEmailTakenError } from '@utils/errors';
import type { TCompany, TCompanyMemberWithDetails, TImage } from '@utils/types';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';
import type { MutableRefObject } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TEditCompanyInformationFormValues } from '../EditCompanyInformationForm/EditCompanyInformationForm';
import EditInformationCompanyForm from '../EditCompanyInformationForm/EditCompanyInformationForm';
import type { TEditCompanySettingsInformationFormValues } from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';
import EditCompanySettingsTabs from '../EditCompanySettingsTabs/EditCompanySettingsTabs';
import css from './EditCompanyWizard.module.scss';
import {
  COMPANY_INFORMATION_TAB,
  COMPANY_SETTINGS_TAB,
  createSubmitCreateCompanyValues,
  createSubmitUpdateCompanyValues,
  EDIT_COMPANY_WIZARD_TABS,
  getInitialLocationValues,
} from './utils';

type TEditCompanyWizardTab = {
  tab: string;
  onCompleteEditCompanyWizardTab: (
    values: TEditCompanyInformationFormValues &
      TEditCompanySettingsInformationFormValues,
  ) => void;
  formRef: MutableRefObject<
    FormApi<
      TEditCompanyInformationFormValues,
      Partial<TEditCompanySettingsInformationFormValues>
    >
  >;
  isEditting: boolean;
  company: TCompany;
  onCompanyLogoUpload: (params: { id: string; file: File }) => any;
  onRemoveCompanyLogo: () => void;
  uploadCompanyLogoError: any;
  uploadedCompanyLogo: TImage | null | { id: string; file: File };
  uploadingCompanyLogo: boolean;
  companyMembers: TCompanyMemberWithDetails[];
} & TFormTabChildrenProps;

const redirectAfterDraftUpdate = (
  companyId: string,
  tab: string,
  tabs: string[],
  router: any,
) => {
  const tabIndex = tabs.findIndex((cur) => cur === tab);
  const nextTab = tabs[tabIndex + 1];
  return router.push({
    pathname: `/admin/company/${companyId}/edit?tab=${nextTab}`,
  });
};

const tabCompleted = (tab: string, _user: TCompany): boolean => {
  switch (tab) {
    case COMPANY_INFORMATION_TAB:
      return true;
    case COMPANY_SETTINGS_TAB:
      return true;
    default:
      return true;
  }
};

const EditCompanyWizardTab: React.FC<TEditCompanyWizardTab> = (props) => {
  const {
    tab,
    onCompleteEditCompanyWizardTab,
    formRef,
    isEditting,
    company,
    onCompanyLogoUpload,
    uploadedCompanyLogo,
    uploadCompanyLogoError,
    onRemoveCompanyLogo,
    uploadingCompanyLogo,
    companyMembers,
  } = props;

  const initialValues = useMemo(() => {
    switch (tab) {
      case COMPANY_INFORMATION_TAB: {
        return (
          company
            ? {
                name: User(company).getProfile().displayName,
                location: getInitialLocationValues(company),
                tax: User(company).getPrivateData().tax,
                note: User(company).getPublicData().note,
                phoneNumber: User(company).getPublicData().phoneNumber,
              }
            : {}
        ) as TEditCompanyInformationFormValues;
      }
      case COMPANY_SETTINGS_TAB: {
        return {};
      }
      default:
        return {};
    }
  }, [JSON.stringify(company)]);

  switch (tab) {
    case COMPANY_INFORMATION_TAB:
      return (
        <EditInformationCompanyForm
          formRef={formRef}
          onSubmit={onCompleteEditCompanyWizardTab}
          isEditting={isEditting}
          initialValues={initialValues}
        />
      );
    case COMPANY_SETTINGS_TAB:
      return (
        <EditCompanySettingsTabs
          onCompanyLogoUpload={onCompanyLogoUpload}
          uploadedCompanyLogo={uploadedCompanyLogo}
          uploadCompanyLogoError={uploadCompanyLogoError}
          onRemoveCompanyLogo={onRemoveCompanyLogo}
          uploadingCompanyLogo={uploadingCompanyLogo}
          formRef={formRef}
          onSubmit={onCompleteEditCompanyWizardTab as any}
          companyMembers={companyMembers}
          company={company}
        />
      );
    default:
      return <></>;
  }
};

const EditCompanyWizard = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const formRef = useRef() as MutableRefObject<
    FormApi<
      TEditCompanyInformationFormValues,
      Partial<TEditCompanySettingsInformationFormValues>
    >
  >;

  const router = useRouter();
  const { tab: selectedTab = COMPANY_INFORMATION_TAB, companyId } =
    router.query;

  const {
    createCompanyInProgress,
    createCompanyError,
    updateCompanyInProgress,
    updateCompanyError,
    company,
    uploadedCompanyLogo,
    uploadingCompanyLogo,
    uploadCompanyLogoError,
  } = useAppSelector((state) => state.company, shallowEqual);

  const { companyMembers } = useAppSelector(
    (state) => state.companyMember,
    shallowEqual,
  );

  const onCompleteEditCompanyWizardTab = async (
    values: TEditCompanyInformationFormValues &
      TEditCompanySettingsInformationFormValues,
  ) => {
    const submitValues = companyId
      ? createSubmitUpdateCompanyValues(values, selectedTab as string)
      : createSubmitCreateCompanyValues(values, selectedTab as string);
    const { payload, error } = (
      companyId
        ? await dispatch(companyThunks.adminUpdateCompany(submitValues))
        : await dispatch(companyThunks.adminCreateCompany(submitValues))
    ) as any;

    const isDraft =
      User(payload).getMetadata().userState === ECompanyStates.draft;
    const id = User(payload).getId();

    if (!error && isDraft) {
      return redirectAfterDraftUpdate(
        id,
        selectedTab as string,
        EDIT_COMPANY_WIZARD_TABS,
        router,
      );
    }
  };

  const formErrorMessage = isSignUpEmailTakenError(createCompanyError)
    ? intl.formatMessage({
        id: 'CreateCompanyPage.createCompanyEmailAlreadyTaken',
      })
    : intl.formatMessage({
        id: 'CreateCompanyPage.createCompanyFailed',
      });

  useEffect(() => {
    dispatch(companySlice.actions.clearError());

    return () => {
      dispatch(companySlice.actions.clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!companyId) return;
    dispatch(companyThunks.showCompany(companyId as string));
  }, [companyId]);

  const tabLink = (tab: string) => {
    return {
      path: !companyId
        ? `/admin/company/create`
        : `/admin/company/${companyId}/edit`,
      to: {
        search: `tab=${tab}`,
      },
    };
  };

  const isNewUserFlow = !company;

  const handleRedirectOnSwitchTab = (nearestActiveTab: string) => {
    router.push(
      {
        pathname: !company
          ? adminRoutes.CreateCompany.path
          : adminRoutes.EditCompany.path,
      },
      {
        search: `tab=${nearestActiveTab}`,
      },
    );
  };

  useRedirectTabWizard({
    isNew: isNewUserFlow,
    entity: company as TCompany,
    selectedTab: selectedTab as string,
    tabs: EDIT_COMPANY_WIZARD_TABS,
    tabCompleted: tabCompleted as any,
    handleRedirect: handleRedirectOnSwitchTab,
  });

  const inProgress = createCompanyInProgress || updateCompanyInProgress;

  const errorMessage =
    formErrorMessage ||
    (updateCompanyError && updateCompanyError.message) ||
    (createCompanyError && createCompanyError.message);

  const onSubmitOutsideForm = () => {
    formRef.current.submit();
  };

  const uploadCompanyLogo = (params: { id: string; file: File }) => {
    return dispatch(companyThunks.requestUploadCompanyLogo(params));
  };

  const removeCompanyLogo = () => {
    dispatch(companySlice.actions.removeCompanyLogo());
  };

  useEffect(() => {
    console.log(selectedTab === COMPANY_SETTINGS_TAB && companyId);
    if (selectedTab === COMPANY_SETTINGS_TAB && companyId) {
      dispatch(companyMemberThunks.queryCompanyMembers(companyId as string));
    }
  }, [selectedTab, companyId, dispatch]);

  return (
    <>
      <FormWizard>
        {EDIT_COMPANY_WIZARD_TABS.map((tab) => (
          <EditCompanyWizardTab
            key={tab}
            tab={tab}
            tabId={tab}
            selected={selectedTab === tab}
            tabLabel={intl.formatMessage({
              id: `EditPartnerMenuWizard.${tab}TabLabel`,
            })}
            tabLinkProps={tabLink(tab)}
            onCompleteEditCompanyWizardTab={onCompleteEditCompanyWizardTab}
            formRef={formRef}
            isEditting={!!companyId}
            company={company as TCompany}
            onCompanyLogoUpload={uploadCompanyLogo}
            uploadedCompanyLogo={uploadedCompanyLogo}
            uploadingCompanyLogo={uploadingCompanyLogo}
            uploadCompanyLogoError={uploadCompanyLogoError}
            onRemoveCompanyLogo={removeCompanyLogo}
            companyMembers={companyMembers}
          />
        ))}
      </FormWizard>
      <div className={css.buttons}>
        <Button className={css.goBack}>
          <FormattedMessage id="EditCompanyWizard.goBack" />
        </Button>
        <Button
          inProgress={inProgress}
          disabled={inProgress}
          onClick={onSubmitOutsideForm}
          type="button">
          <FormattedMessage id="EditCompanyWizard.nextStep" />
        </Button>
      </div>
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </>
  );
};

export default EditCompanyWizard;
