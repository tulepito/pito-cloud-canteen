import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';

export type TConfirmNotifyUserFormValues = { userRoles: string[] };

type TExtraProps = {
  shouldHideParticipantOption: boolean;
  setUserRoles: (value: string[]) => void;
};
type TConfirmNotifyUserFormComponentProps =
  FormRenderProps<TConfirmNotifyUserFormValues> & Partial<TExtraProps>;
type TConfirmNotifyUserFormProps = FormProps<TConfirmNotifyUserFormValues> &
  TExtraProps;

const userRoleOptions = [
  { key: 'booker', label: 'Khách hàng' },
  { key: 'participant', label: 'Thành viên tham gia' },
];

const ConfirmNotifyUserFormComponent: React.FC<
  TConfirmNotifyUserFormComponentProps
> = (props) => {
  const { shouldHideParticipantOption, values, handleSubmit, setUserRoles } =
    props;

  const options = shouldHideParticipantOption
    ? userRoleOptions.slice(0, 1)
    : userRoleOptions;

  useEffect(() => {
    if (setUserRoles) setUserRoles(values.userRoles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <FieldCheckboxGroup
        id={'ConfirmNotifyUserForm.userRoles'}
        name="userRoles"
        options={options}
      />
    </Form>
  );
};

const ConfirmNotifyUserForm: React.FC<TConfirmNotifyUserFormProps> = (
  props,
) => {
  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      component={ConfirmNotifyUserFormComponent}
    />
  );
};

export default ConfirmNotifyUserForm;
