import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { isEqual } from 'lodash';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import {
  composeValidators,
  numberMaxLength,
  parseNum,
} from '@src/utils/validators';

import css from './AdminAccountSettingForm.module.scss';

export type TAdminAccountSettingFormValues = {
  systemVATPercentage: number;
  systemServiceFeePercentage: number;
};

type TExtraProps = {
  inProgress: boolean;
  updateError: any;
  submittedValues: TAdminAccountSettingFormValues;
};
type TAdminAccountSettingFormComponentProps =
  FormRenderProps<TAdminAccountSettingFormValues> & Partial<TExtraProps>;
type TAdminAccountSettingFormProps = FormProps<TAdminAccountSettingFormValues> &
  TExtraProps;

const AdminAccountSettingFormComponent: React.FC<
  TAdminAccountSettingFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    inProgress,
    updateError,
    invalid,
    submittedValues,
    values,
  } = props;

  const submitted = isEqual(submittedValues, values);

  return (
    <Form className={css.form} onSubmit={handleSubmit}>
      <>
        <FieldTextInput
          name="systemVATPercentage"
          id="systemVATPercentage"
          type="number"
          label="% VAT"
          placeholder="Nhập VAT"
          className={css.field}
          rightIcon={<span>%</span>}
          rightIconContainerClassName={css.percentage}
          validate={composeValidators(
            numberMaxLength('% VAT không hợp lệ', 100),
          )}
          parse={parseNum as any}
        />
        <FieldTextInput
          name="systemServiceFeePercentage"
          id="systemServiceFeePercentage"
          type="number"
          label="% Phí dịch vụ"
          placeholder="Nhập % phí dịch vụ"
          rightIcon={<span>%</span>}
          rightIconContainerClassName={css.percentage}
          className={css.field}
          validate={composeValidators(
            numberMaxLength('% Phí dịch vụ không hợp lệ', 100),
          )}
          parse={parseNum as any}
        />
        {!!updateError && <ErrorMessage message="Lưu không thành công" />}
        <Button
          inProgress={inProgress}
          disabled={inProgress || invalid}
          ready={submitted}
          className={css.button}>
          Lưu thay đổi
        </Button>
      </>
    </Form>
  );
};

const AdminAccountSettingForm: React.FC<TAdminAccountSettingFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={AdminAccountSettingFormComponent} />;
};

export default AdminAccountSettingForm;
