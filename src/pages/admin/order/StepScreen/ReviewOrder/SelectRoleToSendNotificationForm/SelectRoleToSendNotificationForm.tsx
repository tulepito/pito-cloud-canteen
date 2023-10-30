import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';

import css from './SelectRoleToSendNotificationForm.module.scss';

export type TSelectRoleToSendNotificationFormValues = {
  role: string[];
};

type TExtraProps = {
  inProgress?: boolean;
  isNormalOrder?: boolean;
};
type TSelectRoleToSendNotificationFormComponentProps =
  FormRenderProps<TSelectRoleToSendNotificationFormValues> &
    Partial<TExtraProps>;
type TSelectRoleToSendNotificationFormProps =
  FormProps<TSelectRoleToSendNotificationFormValues> & TExtraProps;

const ROLE_LIST = [
  {
    key: 'company',
    label: 'Khách hàng',
  },
  {
    key: 'partner',
    label: 'Đối tác',
  },
  {
    key: 'participant',
    label: 'Người tham gia',
  },
];

const SelectRoleToSendNotificationFormComponent: React.FC<
  TSelectRoleToSendNotificationFormComponentProps
> = (props) => {
  const { handleSubmit, form, values, inProgress, isNormalOrder } = props;
  const roleListMaybe = isNormalOrder ? ROLE_LIST.slice(0, 2) : ROLE_LIST;
  const { role: roleValue = [] } = values;
  const onCheckAllChange = (event: any) => {
    const { checked, value, name } = event.target;

    let newValues = [...roleValue];
    if (!checked) {
      newValues = [];
      form.change(name, []);
    } else {
      form.change(name, [value]);
      newValues = [...ROLE_LIST.map((option) => option.key)];
    }
    form.change('role', newValues);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.text}>
        Chọn đối tượng gửi thông báo thay đổi đơn hàng
      </div>
      {roleListMaybe.map((role) => (
        <FieldCheckbox
          key={role.key}
          name="role"
          label={role.label}
          value={role.key}
          id={role.key}
        />
      ))}
      <FieldCheckbox
        name="roleAll"
        label="Tất cả"
        value="all"
        id="all"
        className={css.otherCheckbox}
        customOnChange={onCheckAllChange}
      />
      <Button
        type="submit"
        className={css.submitButton}
        inProgress={inProgress}>
        Cập nhật
      </Button>
    </Form>
  );
};

const SelectRoleToSendNotificationForm: React.FC<
  TSelectRoleToSendNotificationFormProps
> = (props) => {
  return (
    <FinalForm
      {...props}
      component={SelectRoleToSendNotificationFormComponent}
    />
  );
};

export default SelectRoleToSendNotificationForm;
