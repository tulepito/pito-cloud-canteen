/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import { useImperativeHandle, useMemo, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';

import type { TAdminTransferCompanyOwnerParams } from '@apis/companyApi';
import { InlineTextButton } from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import type { TImageUploadFnReturnValue } from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import FieldPhotoUpload from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import BackdropModal from '@components/Modal/BackdropModal/BackdropModal';
import useBoolean from '@hooks/useBoolean';
import useQueryNewMemberUsers from '@hooks/useQueryNewMemberUsers';
import { COMPANY_LOGO_VARIANTS } from '@redux/slices/company.slice';
import type { TCompanyGroup } from '@src/types/companyGroup';
import { FOOD_SPECIAL_DIET_OPTIONS } from '@src/utils/options';
import { User } from '@utils/data';
import type {
  TCompany,
  TCompanyMemberWithDetails,
  TImage,
  TObject,
} from '@utils/types';
import { nonEmptyImage } from '@utils/validators';

import type { TAddCompanyGroupsFormValues } from '../AddCompanyGroupsForm/AddCompanyGroupsForm';
import AddCompanyGroupsForm from '../AddCompanyGroupsForm/AddCompanyGroupsForm';
import AddCompanyMembersForm from '../AddCompanyMembersForm/AddCompanyMembersForm';
import { COMPANY_SETTING_INFORMATION_TAB_ID } from '../EditCompanyWizard/utils';
import ManageCompanyGroupsTable from '../ManageCompanyGroupsTable/ManageCompanyGroupsTable';
import ManageCompanyMembersTable from '../ManageCompanyMembersTable/ManageCompanyMembersTable';
import type { TUpdateCompanyGroupFormValues } from '../UpdateCompanyGroupForm/UpdateCompanyGroupForm';
import UpdateCompanyGroupForm from '../UpdateCompanyGroupForm/UpdateCompanyGroupForm';

import css from './EditCompanySettingsInformation.module.scss';

export type TEditCompanySettingsInformationFormValues = {
  companyLogo?: any;
  nutritions?: string[];
  tabValue?: string;
};

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';

type TExtraProps = {
  onCompanyLogoUpload: (params: {
    id: string;
    file: File;
  }) => Promise<TImageUploadFnReturnValue>;
  onRemoveCompanyLogo: (id: string) => void;
  uploadCompanyLogoError: any;
  uploadedCompanyLogo: TImage | null | { id: string; file: File };
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
  formRef: any;
  deleteMemberInProgress: boolean;
  deleteMemberError: any;
  onRemoveMember: (email: string) => void;
  onRemoveGroup: (id: string) => void;
  deleteGroupInProgress: boolean;
  deleteGroupError: any;
  onUpdateMemberPermission: (params: {
    memberEmail: string;
    permission: string;
  }) => void;
  updatingMemberPermissionEmail: string | null;
  updateMemberPermissionError: any;
  onTransferCompanyOwner: (params: TAdminTransferCompanyOwnerParams) => void;
  transferCompanyOwnerError: any;
  transferCompanyOwnerInProgress: boolean;
  queryMembersInProgress: boolean;
  queryMembersError: any;
  companyId: string;
  resetCompanyMemberSliceError: () => void;
  resetTransferError: () => void;
};
type TEditCompanySettingsInformationFormComponentProps =
  FormRenderProps<TEditCompanySettingsInformationFormValues> &
    Partial<TExtraProps>;
type TEditCompanySettingsInformationFormProps =
  FormProps<TEditCompanySettingsInformationFormValues> & TExtraProps;

const EditCompanySettingsInformationFormComponent: React.FC<
  TEditCompanySettingsInformationFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    onCompanyLogoUpload,
    uploadCompanyLogoError,
    uploadedCompanyLogo,
    onRemoveCompanyLogo,
    companyMembers,
    company,
    onAddMembersToCompany,
    onAddGroupToCompany,
    addMembersInProgress,
    addMembersError,
    createGroupInProgress,
    createGroupError,
    onUpdateGroup,
    updateGroupInProgress,
    updateGroupError,
    formRef,
    form,
    values,
    deleteMemberInProgress,
    deleteMemberError,
    onRemoveMember,
    onRemoveGroup,
    deleteGroupInProgress,
    deleteGroupError,
    onUpdateMemberPermission,
    updatingMemberPermissionEmail,
    updateMemberPermissionError,
    onTransferCompanyOwner,
    transferCompanyOwnerError,
    transferCompanyOwnerInProgress,
    queryMembersInProgress,
    queryMembersError,
    companyId,
    resetCompanyMemberSliceError,
    resetTransferError,
  } = props;

  useImperativeHandle(formRef, () => form);

  const intl = useIntl();
  const companyGroups = User(company as TCompany).getMetadata().groups || [];
  const {
    users,
    queryUsersByEmail,
    queryUsersInProgress,
    removeUserById,
    notFoundUsers,
    removeNotFoundUserByEmail,
    setInitialUsers,
    queryError,
  } = useQueryNewMemberUsers();
  const {
    value: isCreateMemberModalOpen,
    setTrue: openCreateMemberModal,
    setFalse: closeCreateMemberModal,
  } = useBoolean(false);

  const {
    value: isCreateGroupModalOpen,
    setTrue: openCreateGroupModal,
    setFalse: closeCreateGroupModal,
  } = useBoolean(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const onSelectGroup = (id: string) => {
    setSelectedGroupId(id);
  };

  const onUnSelectGroup = () => {
    setSelectedGroupId(null);
  };

  const handleAddMemberModalSubmit = async (values: TObject) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    if (onAddMembersToCompany) {
      const { error } = ((await onAddMembersToCompany(values)) as any) || {};
      if (!error) {
        closeCreateMemberModal();
        setInitialUsers([], []);
      }
    }
  };

  const handleCreateGroupModalSubmit = async (
    values: TAddCompanyGroupsFormValues,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    if (onAddGroupToCompany) {
      const { error } = ((await onAddGroupToCompany(values)) as any) || {};
      if (!error) {
        closeCreateGroupModal();
      }
    }
  };

  const handleUpdateGroupModalSubmit = async (
    values: TUpdateCompanyGroupFormValues,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    if (onUpdateGroup) {
      const { error } = ((await onUpdateGroup(values)) as any) || {};
      if (!error) {
        setSelectedGroupId(null);
      }
    }
  };

  const existedCompanyMembers = useMemo(
    () =>
      companyMembers?.filter(
        (member) => !!member.id && member?.groups?.length === 0,
      ),
    [JSON.stringify(companyMembers)],
  );

  const initialUpdateGroupFormValues = useMemo(() => {
    const group = companyGroups.find(
      (group: TCompanyGroup) => group.id === selectedGroupId,
    );

    const members = companyMembers?.filter((member) =>
      (member.groups || []).includes(selectedGroupId as string),
    );

    return {
      companyMemberEmails: members?.map((member) => member.email),
      groupName: group?.name,
      companyGroups,
      deletedMemberEmails: [],
      groupId: selectedGroupId as string,
      tempAddedMemberEmails: members?.map((member) => member.email),
    };
  }, [
    selectedGroupId,
    JSON.stringify(companyMembers),
    JSON.stringify(companyGroups),
  ]);

  const handleQueryNewMembers = (emails: string[]) => {
    return queryUsersByEmail(emails, companyId as string);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <div className={css.root}>
          <div className={css.fieldSection}>
            <h3 className={css.largeTitle}>
              <FormattedMessage id="EditCompanySettingsInformationForm.logoSettingTitle" />
            </h3>
            <FieldPhotoUpload
              name="companyLogo"
              accept={ACCEPT_IMAGES}
              id="companyLogo"
              className={css.companyLogoField}
              image={uploadedCompanyLogo || values.companyLogo}
              variants={COMPANY_LOGO_VARIANTS}
              onImageUpload={onCompanyLogoUpload as any}
              onRemoveImage={onRemoveCompanyLogo as any}
              uploadImageError={uploadCompanyLogoError}
              validate={nonEmptyImage(
                intl.formatMessage({
                  id: 'EditPartnerBasicInformationForm.coverRequired',
                }),
              )}
            />
          </div>
          <div className={css.fieldSection}>
            <h3 className={css.largeTitle}>
              <FormattedMessage id="EditCompanySettingsInformationForm.memberSettingMember" />
            </h3>
            <div className={css.sectionHeader}>
              <h4 className={css.smallTitle}>
                <FormattedMessage id="EditCompanySettingsInformationForm.listMember" />
              </h4>
              <InlineTextButton
                type="button"
                onClick={openCreateMemberModal}
                className={css.addButtonWrapper}>
                <div className={css.addIconWrapper}>
                  <IconAdd />
                </div>
                <FormattedMessage id="EditCompanySettingsInformationForm.memberSettingCreate" />
              </InlineTextButton>
            </div>
            <ManageCompanyMembersTable
              companyMembers={companyMembers as TCompanyMemberWithDetails[]}
              companyGroups={companyGroups as TCompanyGroup[]}
              onRemoveMember={onRemoveMember as any}
              deleteMemberInProgress={deleteMemberInProgress as boolean}
              deleteMemberError={deleteMemberError}
              onUpdateMemberPermission={onUpdateMemberPermission as any}
              updatingMemberPermissionEmail={
                updatingMemberPermissionEmail as string
              }
              updateMemberPermissionError={updateMemberPermissionError}
              onTransferCompanyOwner={onTransferCompanyOwner as any}
              transferCompanyOwnerError={transferCompanyOwnerError}
              transferCompanyOwnerInProgress={transferCompanyOwnerInProgress}
              queryMembersInProgress={queryMembersInProgress}
              queryMembersError={queryMembersError}
              companyId={companyId as string}
              resetCompanyMemberSliceError={resetCompanyMemberSliceError as any}
              resetTransferError={resetTransferError as any}
            />
          </div>
          <div className={css.line}></div>
          <div className={css.fieldSection}>
            <div className={css.sectionHeader}>
              <h4 className={css.smallTitle}>
                <FormattedMessage id="EditCompanySettingsInformationForm.groupList" />
              </h4>
              <InlineTextButton
                className={css.addButtonWrapper}
                type="button"
                onClick={openCreateGroupModal}>
                <div className={css.addIconWrapper}>
                  <IconAdd />
                </div>
                <FormattedMessage id="EditCompanySettingsInformationForm.groupSettingCreate" />
              </InlineTextButton>
            </div>
            <ManageCompanyGroupsTable
              companyGroups={companyGroups as TCompanyGroup[]}
              onSelectGroup={onSelectGroup}
              onRemoveGroup={onRemoveGroup as any}
              deleteGroupInProgress={deleteGroupInProgress as boolean}
              deleteGroupError={deleteGroupError}
            />
          </div>
          <div className={css.line}></div>
          <div className={css.fieldSection}>
            <h3 className={css.largeTitle}>
              <FormattedMessage id="EditCompanySettingsInformationForm.mealSettingTitle" />
            </h3>
            <div>
              <FieldCheckboxGroup
                listClassName={css.checkboxGroup}
                id="EditCompanySettingsInformationForm.mealSetting"
                options={FOOD_SPECIAL_DIET_OPTIONS}
                name="nutritions"
                label={intl.formatMessage({
                  id: 'EditCompanySettingsInformationForm.mealSetting',
                })}
              />
            </div>
          </div>
        </div>
      </Form>
      <BackdropModal
        title={intl.formatMessage({
          id: 'EditCompanySettingsInformationForm.createMemberModalTitle',
        })}
        isOpen={isCreateMemberModalOpen}
        handleClose={closeCreateMemberModal}>
        {isCreateMemberModalOpen && (
          <AddCompanyMembersForm
            onSubmit={handleAddMemberModalSubmit}
            users={users}
            queryUsersByEmail={handleQueryNewMembers}
            queryUserInProgress={queryUsersInProgress}
            removeUserById={removeUserById}
            notFoundUsers={notFoundUsers}
            removeNotFoundUserByEmail={removeNotFoundUserByEmail}
            handleCancel={closeCreateMemberModal}
            inProgress={addMembersInProgress as boolean}
            formError={addMembersError || queryError}
          />
        )}
      </BackdropModal>
      <BackdropModal
        isOpen={isCreateGroupModalOpen}
        handleClose={closeCreateGroupModal}
        title={intl.formatMessage({
          id: 'EditCompanySettingsInformationForm.createGroupTitle',
        })}>
        {isCreateGroupModalOpen && (
          <AddCompanyGroupsForm
            onSubmit={handleCreateGroupModalSubmit}
            handleCancel={closeCreateGroupModal}
            inProgress={createGroupInProgress as boolean}
            formError={createGroupError}
            companyMembers={
              existedCompanyMembers as TCompanyMemberWithDetails[]
            }
          />
        )}
      </BackdropModal>
      <BackdropModal
        containerClassName={css.updateModalContainer}
        title={initialUpdateGroupFormValues.groupName}
        isOpen={!!selectedGroupId}
        handleClose={onUnSelectGroup}>
        <UpdateCompanyGroupForm
          handleCancel={onUnSelectGroup}
          onSubmit={handleUpdateGroupModalSubmit}
          initialValues={initialUpdateGroupFormValues}
          inProgress={updateGroupInProgress as boolean}
          formError={updateGroupError}
          allCompanyMembers={
            existedCompanyMembers as TCompanyMemberWithDetails[]
          }
          selectedCompanyMembers={companyMembers as TCompanyMemberWithDetails[]}
        />
      </BackdropModal>
    </>
  );
};

const EditCompanySettingsInformationForm: React.FC<
  TEditCompanySettingsInformationFormProps
> = (props) => {
  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      initialValues={{
        ...props.initialValues,
        tabValue: COMPANY_SETTING_INFORMATION_TAB_ID,
      }}
      component={EditCompanySettingsInformationFormComponent}
    />
  );
};

export default EditCompanySettingsInformationForm;
