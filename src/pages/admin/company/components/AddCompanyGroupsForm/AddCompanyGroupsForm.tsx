import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TCompanyMemberWithDetails } from '@utils/types';
import { required } from '@utils/validators';

import FieldCompanyMemberCheckbox from '../FieldCompanyMemberCheckbox/FieldCompanyMemberCheckbox';

import css from './AddCompanyGroupsForm.module.scss';

export type TAddCompanyGroupsFormValues = {
  groupName: string;
  members: TCompanyMemberWithDetails[];
};

type TExtraProps = {
  inProgress: boolean;
  handleCancel: () => void;
  formError: any;
  companyMembers: TCompanyMemberWithDetails[];
};
type TAddCompanyGroupsFormComponentProps =
  FormRenderProps<TAddCompanyGroupsFormValues> & Partial<TExtraProps>;
type TAddCompanyGroupsFormProps = FormProps<TAddCompanyGroupsFormValues> &
  TExtraProps;

const AddCompanyGroupsFormComponent: React.FC<
  TAddCompanyGroupsFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    inProgress,
    handleCancel,
    formError,
    companyMembers = [],
  } = props;
  const intl = useIntl();

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.formWrapper}>
        <FieldTextInput
          className={css.groupName}
          name="groupName"
          id="groupName"
          label={intl.formatMessage({
            id: 'AddCompanyGroupsFormComponent.groupNameLabel',
          })}
          placeholder={intl.formatMessage({
            id: 'AddCompanyGroupsFormComponent.groupNamePlaceholder',
          })}
          validate={required(
            intl.formatMessage({
              id: 'AddCompanyGroupsFormComponent.groupNameRequired',
            }),
          )}
        />
      </div>
      <RenderWhen condition={!!companyMembers?.length}>
        <>
          <div className={css.members}>
            {companyMembers.map((member) => (
              <FieldCompanyMemberCheckbox
                key={member.id.uuid}
                className={css.checkbox}
                member={member}
              />
            ))}
          </div>
          <div className={css.actionBtn}>
            <Button
              disabled={inProgress}
              inProgress={inProgress}
              className={css.submitButton}>
              {intl.formatMessage({ id: 'AddCompanyGroupsForm.submitButton' })}
            </Button>
            <Button
              disabled={inProgress}
              onClick={handleCancel}
              className={css.lightButton}
              type="button">
              {intl.formatMessage({ id: 'AddCompanyGroupsForm.cancelButton' })}
            </Button>
          </div>
        </>
      </RenderWhen>

      <RenderWhen condition={!companyMembers?.length}>
        <p className="text-center text-gray-500">
          Không có thành viên nào không có nhóm hiện tại.
        </p>
      </RenderWhen>

      <RenderWhen condition={!isEmpty(formError)}>
        <ErrorMessage message={formError?.message} />
      </RenderWhen>
    </Form>
  );
};

const AddCompanyGroupsForm: React.FC<TAddCompanyGroupsFormProps> = (props) => {
  return <FinalForm {...props} component={AddCompanyGroupsFormComponent} />;
};

export default AddCompanyGroupsForm;
