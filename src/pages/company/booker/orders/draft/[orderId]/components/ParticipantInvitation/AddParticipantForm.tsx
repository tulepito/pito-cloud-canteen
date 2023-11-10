import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';

import css from './AddParticipantForm.module.scss';

export type TAddParticipantFormValues = {};

type TExtraProps = {};
type TAddParticipantFormComponentProps =
  FormRenderProps<TAddParticipantFormValues> & Partial<TExtraProps>;
type TAddParticipantFormProps = FormProps<TAddParticipantFormValues> &
  TExtraProps;

const AddParticipantFormComponent: React.FC<
  TAddParticipantFormComponentProps
> = (props) => {
  const { handleSubmit } = props;

  return (
    <Form className={css.formRoot} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <div className={css.fieldContainer}>
          <FieldTextInput
            id="AddParticipantForm.emails"
            name="emails"
            placeholder="Nhập email để thêm thành viên"
          />
        </div>
        <Button>Thêm</Button>
      </div>
      <div className={css.hint}>
        *Email được phân cách bằng khoảng trắng. Ví dụ: a1@gmail.com
        b2@gmail.com
      </div>
    </Form>
  );
};

const AddParticipantForm: React.FC<TAddParticipantFormProps> = (props) => {
  return <FinalForm {...props} component={AddParticipantFormComponent} />;
};

export default AddParticipantForm;
