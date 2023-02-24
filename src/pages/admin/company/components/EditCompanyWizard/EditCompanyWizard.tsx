/* eslint-disable @typescript-eslint/no-shadow */
import type { CreateGroupApiBody } from '@apis/companyApi';
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
import type {
  TCompany,
  TCompanyMemberWithDetails,
  TImage,
  TObject,
} from '@utils/types';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';
import type { MutableRefObject } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TAddCompanyGroupsFormValues } from '../AddCompanyGroupsForm/AddCompanyGroupsForm';
import type { TEditCompanyBankAccountsFormValues } from '../EditCompanyBankAccountsForm/EditCompanyBankAccountsForm';
import type { TEditCompanyInformationFormValues } from '../EditCompanyInformationForm/EditCompanyInformationForm';
import EditInformationCompanyForm from '../EditCompanyInformationForm/EditCompanyInformationForm';
import type { TEditCompanySettingsInformationFormValues } from '../EditCompanySettingsInformationForm/EditCompanySettingsInformationForm';
import EditCompanySettingsTabs from '../EditCompanySettingsTabs/EditCompanySettingsTabs';
import type { TUpdateCompanyGroupFormValues } from '../UpdateCompanyGroupForm/UpdateCompanyGroupForm';
import css from './EditCompanyWizard.module.scss';
import {
  COMPANY_INFORMATION_TAB,
  COMPANY_SETTINGS_TAB,
  createSubmitAddMembersToCompanyValues,
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
  deleteGroupInProgress: boolean;
  deleteGroupError: any;
  onRemoveGroup: (groupId: string) => void;
  onUpdateMemberPermission: (params: {
    memberEmail: string;
    permission: string;
  }) => void;
} & TFormTabChildrenProps;

const defaultBankAccounts = [
  {
    bankId: '',
    bankAgency: '',
    bankAccountNumber: '',
    bankOwnerName: '',
    isDefault: true,
  },
];

const redirectAfterDraftUpdate = (
  companyId: string,
  tab: string,
  tabs: string[],
  router: any,
) => {
  const tabIndex = tabs.findIndex((cur) => cur === tab);
  const nextTab = tabs[tabIndex + 1];
  if (!nextTab) return;
  return router.push({
    pathname: `/admin/company/${companyId}/edit`,
    query: {
      tab: nextTab,
    },
  });
};

const tabCompleted = (tab: string, company: TCompany | null): boolean => {
  const { profileImage } = company || {};
  const { profile } = company?.attributes || {};
  const {
    displayName,
    publicData = {},
    privateData = {},
    metadata = {},
  } = profile || {};
  const { location, phoneNumber } = publicData;
  const { tax, bankAccounts } = privateData;
  const { members = {}, groups = [] } = metadata;

  const isCompanyInformationTabCompleted = !!(
    displayName &&
    location &&
    phoneNumber &&
    tax
  );

  const isCompanySettingsTabCompleted = !!(
    profileImage &&
    Object.keys(members).length > 0 &&
    groups.length > 0 &&
    bankAccounts.length > 0
  );

  switch (tab) {
    case COMPANY_INFORMATION_TAB:
      return isCompanyInformationTabCompleted;
    case COMPANY_SETTINGS_TAB:
      return isCompanySettingsTabCompleted;
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
    onAddMembersToCompany,
    onAddGroupToCompany,
    addMembersInProgress,
    addMembersError,
    createGroupInProgress,
    createGroupError,
    onUpdateGroup,
    updateGroupInProgress,
    updateGroupError,
    deleteMemberInProgress,
    deleteMemberError,
    onRemoveMember,
    deleteGroupInProgress,
    deleteGroupError,
    onRemoveGroup,
    onUpdateMemberPermission,
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
        return {
          companyLogo: company?.profileImage,
          companyNutritions: User(company).getPublicData().companyNutritions,
          bankAccounts:
            User(company).getPrivateData().bankAccounts || defaultBankAccounts,
        } as TEditCompanySettingsInformationFormValues &
          TEditCompanyBankAccountsFormValues;
      }
      default:
        return {};
    }
  }, [JSON.stringify(company)]);

  switch (tab) {
    case COMPANY_INFORMATION_TAB:
      return (
        <EditInformationCompanyForm
          formRef={
            formRef as MutableRefObject<
              FormApi<TEditCompanyInformationFormValues>
            >
          }
          onSubmit={onCompleteEditCompanyWizardTab as any}
          isEditting={isEditting}
          initialValues={initialValues as TEditCompanyInformationFormValues}
        />
      );
    case COMPANY_SETTINGS_TAB:
      return (
        <EditCompanySettingsTabs
          initialValues={
            initialValues as TEditCompanySettingsInformationFormValues &
              TEditCompanyBankAccountsFormValues
          }
          onCompanyLogoUpload={onCompanyLogoUpload}
          uploadedCompanyLogo={uploadedCompanyLogo}
          uploadCompanyLogoError={uploadCompanyLogoError}
          onRemoveCompanyLogo={onRemoveCompanyLogo}
          uploadingCompanyLogo={uploadingCompanyLogo}
          formRef={formRef}
          onSubmit={onCompleteEditCompanyWizardTab as any}
          companyMembers={companyMembers}
          company={company}
          onAddMembersToCompany={onAddMembersToCompany}
          onAddGroupToCompany={onAddGroupToCompany}
          addMembersInProgress={addMembersInProgress}
          addMembersError={addMembersError}
          createGroupInProgress={createGroupInProgress}
          createGroupError={createGroupError}
          onUpdateGroup={onUpdateGroup}
          updateGroupInProgress={updateGroupInProgress}
          updateGroupError={updateGroupError}
          deleteMemberInProgress={deleteMemberInProgress}
          deleteMemberError={deleteMemberError}
          onRemoveMember={onRemoveMember}
          deleteGroupInProgress={deleteGroupInProgress}
          deleteGroupError={deleteGroupError}
          onRemoveGroup={onRemoveGroup}
          onUpdateMemberPermission={onUpdateMemberPermission}
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
    createGroupInProgress,
    createGroupError,
    updateGroupInProgress,
    updateGroupError,
    deleteGroupInProgress,
    deleteGroupError,
  } = useAppSelector((state) => state.company, shallowEqual);

  const {
    companyMembers,
    addMembersInProgress,
    addMembersError,
    deleteMemberInProgress,
    deleteMemberError,
  } = useAppSelector((state) => state.companyMember, shallowEqual);

  const onCompleteEditCompanyWizardTab = async (
    values: TEditCompanyInformationFormValues &
      TEditCompanySettingsInformationFormValues,
  ) => {
    const submitValues = companyId
      ? createSubmitUpdateCompanyValues(values as any, selectedTab as string)
      : createSubmitCreateCompanyValues(values, selectedTab as string);

    const { payload, error } = (
      companyId
        ? await dispatch(
            companyThunks.adminUpdateCompany({
              id: companyId,
              ...submitValues,
            }),
          )
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

  const formErrorMessage = createCompanyError
    ? isSignUpEmailTakenError(createCompanyError)
      ? intl.formatMessage({
          id: 'CreateCompanyPage.createCompanyEmailAlreadyTaken',
        })
      : intl.formatMessage({
          id: 'CreateCompanyPage.createCompanyFailed',
        })
    : null;

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

  const onAddGroupToCompany = (values: TAddCompanyGroupsFormValues) => {
    const { groupName, members = [] } = values;
    const params = {
      companyId: companyId as string,
      groupInfo: {
        name: groupName,
      },
      groupMembers: members.map((memberEmail) => ({
        email: memberEmail,
        id: companyMembers?.find((member) => member.email === memberEmail)?.id,
      })),
    };
    return dispatch(
      companyThunks.adminCreateGroup(params as unknown as CreateGroupApiBody),
    );
  };

  const onAddMembersToCompany = (values: TObject) => {
    const submitValues = createSubmitAddMembersToCompanyValues(values);
    return dispatch(
      companyMemberThunks.adminAddMembers({
        ...submitValues,
        companyId: companyId as string,
      }),
    );
  };

  const parseMemberEmail = (memberEmails: string[]) => {
    return memberEmails.map((email) => {
      const id = companyMembers.find((member) => member.email === email)?.id;
      return { email, id };
    });
  };

  const onUpdateGroup = (values: TUpdateCompanyGroupFormValues) => {
    const { deletedMemberEmails, groupName, groupId, addedMemberEmails } =
      values;
    return dispatch(
      companyThunks.adminUpdateGroup({
        deletedMembers: parseMemberEmail(deletedMemberEmails) as any,
        companyId: companyId as string,
        groupInfo: {
          name: groupName,
        },
        groupId,
        addedMembers: parseMemberEmail(addedMemberEmails) as any,
      }),
    );
  };

  const onRemoveMember = (email: string) => {
    return dispatch(
      companyMemberThunks.adminDeleteMember({
        companyId: companyId as string,
        email,
      }),
    );
  };

  const onRemoveGroup = (groupId: string) => {
    return dispatch(
      companyThunks.adminDeleteGroup({
        groupId,
        companyId: companyId as string,
      }),
    );
  };

  const onUpdateMemberPermission = (params: {
    memberEmail: string;
    permission: string;
  }) => {
    return dispatch(
      companyMemberThunks.adminUpdateMemberPermission({
        ...params,
        companyId: companyId as string,
      }),
    );
  };

  useEffect(() => {
    if (selectedTab === COMPANY_SETTINGS_TAB && companyId) {
      dispatch(companyMemberThunks.queryCompanyMembers(companyId as string));
    }
  }, [selectedTab, companyId, dispatch]);

  return (
    <>
      <FormWizard>
        {EDIT_COMPANY_WIZARD_TABS.map((tab, index) => {
          const completed = tabCompleted(
            EDIT_COMPANY_WIZARD_TABS[index - 1],
            company as TCompany,
          );
          return (
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
              onAddMembersToCompany={onAddMembersToCompany}
              onAddGroupToCompany={onAddGroupToCompany}
              addMembersInProgress={addMembersInProgress}
              addMembersError={addMembersError}
              createGroupInProgress={createGroupInProgress}
              createGroupError={createGroupError}
              onUpdateGroup={onUpdateGroup}
              updateGroupInProgress={updateGroupInProgress}
              updateGroupError={updateGroupError}
              deleteMemberInProgress={deleteMemberInProgress}
              deleteMemberError={deleteMemberError}
              onRemoveMember={onRemoveMember}
              onRemoveGroup={onRemoveGroup}
              deleteGroupInProgress={deleteGroupInProgress}
              deleteGroupError={deleteGroupError}
              disabled={!completed}
              onUpdateMemberPermission={onUpdateMemberPermission}
            />
          );
        })}
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
