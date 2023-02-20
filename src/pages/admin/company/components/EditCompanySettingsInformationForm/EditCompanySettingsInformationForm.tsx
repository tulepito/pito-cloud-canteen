import { InlineTextButton } from '@components/Button/Button';
import Form from '@components/Form/Form';
import type { TImageUploadFnReturnValue } from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import FieldPhotoUpload from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import BackdropModal from '@components/Modal/BackdropModal/BackdropModal';
import useBoolean from '@hooks/useBoolean';
import useQueryUsers from '@hooks/useQueryUsers';
import { COMPANY_LOGO_VARIANTS } from '@redux/slices/company.slice';
import type { TCompanyGroup } from '@src/types/companyGroup';
import { User } from '@utils/data';
import type { TCompany, TCompanyMemberWithDetails, TImage } from '@utils/types';
import { nonEmptyImage } from '@utils/validators';
import { useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import AddCompanyGroupsForm from '../AddCompanyGroupsForm/AddCompanyGroupsForm';
import AddCompanyMembersForm from '../AddCompanyMembersForm/AddCompanyMembersForm';
import ManageCompanyGroupsTable from '../ManageCompanyGroupsTable/ManageCompanyGroupsTable';
import ManageCompanyMembersTable from '../ManageCompanyMembersTable/ManageCompanyMembersTable';
import css from './EditCompanySettingsInformation.module.scss';

export type TEditCompanySettingsInformationFormValues = {};

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
  } = props;
  const intl = useIntl();
  const companyGroups = User(company as TCompany).getMetadata().groups || [];
  const { users, queryUsersByEmail, queryUsersInProgress, removeUserById } =
    useQueryUsers();
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

  const initialMemberModalValues = useMemo(() => {
    return {};
  }, []);

  const initialGroupModalValues = useMemo(() => {
    return {};
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.root}>
        <div className={css.fieldSection}>
          <h3>
            <FormattedMessage id="EditCompanySettingsInformationForm.logoSettingTitle" />
          </h3>
          <FieldPhotoUpload
            name="companyLogo"
            accept={ACCEPT_IMAGES}
            id="companyLogo"
            className={css.companyLogoField}
            image={uploadedCompanyLogo}
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
          <div className={css.sectionHeader}>
            <h3>
              <FormattedMessage id="EditCompanySettingsInformationForm.memberSettingMember" />
            </h3>
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
            company={company as TCompany}
          />
        </div>
        <div className={css.fieldSection}>
          <div className={css.sectionHeader}>
            <h3>
              <FormattedMessage id="EditCompanySettingsInformationForm.groupSettingMember" />
            </h3>
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
          />
          <BackdropModal
            title={intl.formatMessage({
              id: 'EditCompanySettingsInformationForm.createMemberModalTitle',
            })}
            isOpen={isCreateMemberModalOpen}
            handleClose={closeCreateMemberModal}>
            {isCreateMemberModalOpen && (
              <AddCompanyMembersForm
                onSubmit={() => {}}
                initialValues={initialMemberModalValues}
                users={users}
                queryUsersByEmail={queryUsersByEmail}
                queryUserInProgress={queryUsersInProgress}
                removeUserById={removeUserById}
              />
            )}
          </BackdropModal>
          <BackdropModal
            isOpen={isCreateGroupModalOpen}
            handleClose={closeCreateGroupModal}>
            {isCreateGroupModalOpen && (
              <AddCompanyGroupsForm
                onSubmit={() => {}}
                initialValues={initialGroupModalValues}
              />
            )}
          </BackdropModal>
        </div>
      </div>
    </Form>
  );
};

const EditCompanySettingsInformationForm: React.FC<
  TEditCompanySettingsInformationFormProps
> = (props) => {
  return (
    <FinalForm
      {...props}
      component={EditCompanySettingsInformationFormComponent}
    />
  );
};

export default EditCompanySettingsInformationForm;
