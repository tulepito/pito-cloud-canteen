import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import Form from '@components/Form/Form';

import css from './MenuSettingsForm.module.scss';

export type TMenuSettingsFormValues = {};

type TExtraProps = {};
type TMenuSettingsFormComponentProps =
  FormRenderProps<TMenuSettingsFormValues> & Partial<TExtraProps>;
type TMenuSettingsFormProps = FormProps<TMenuSettingsFormValues> & TExtraProps;

const MenuSettingsFormComponent: React.FC<TMenuSettingsFormComponentProps> = (
  props,
) => {
  const { handleSubmit } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <>
        <div>Thực đơn bạn muốn phục vụ:</div>
        <div>Phong cách ẩm thực nhà hàng của bạn:</div>

        <Alert
          message="Cập nhật thông tin thành công"
          isOpen
          autoClose
          onClose={() => {}}
          type={EAlertType.success}
          hasCloseButton={false}
          position={EAlertPosition.bottomLeft}
          messageClassName={css.alertMessage}
        />
      </>
    </Form>
  );
};

const MenuSettingsForm: React.FC<TMenuSettingsFormProps> = (props) => {
  return <FinalForm {...props} component={MenuSettingsFormComponent} />;
};

export default MenuSettingsForm;
