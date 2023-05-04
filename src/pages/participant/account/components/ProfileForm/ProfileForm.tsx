import { useField, useForm } from 'react-final-form-hooks';

import Button from '@components/Button/Button';
import FixedBottomButtons from '@components/FixedBottomButtons/FixedBottomButtons';
import Form from '@components/Form/Form';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';

import css from './ProfileForm.module.scss';

export type TProfileFormValues = {
  name: string;
  email: string;
  phoneNumber: string;
};

type TProfileFormProps = {
  onSubmit: (values: TProfileFormValues) => void;
  initialValues: TProfileFormValues;
  inProgress: boolean;
};

const validate = (values: TProfileFormValues) => {
  const errors: any = {};
  if (!values.name) {
    errors.name = 'Required';
  }

  return errors;
};

const ProfileForm: React.FC<TProfileFormProps> = ({
  onSubmit,
  initialValues,
  inProgress,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TProfileFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const name = useField('name', form);
  const email = useField('email', form);
  const phoneNumber = useField('phoneNumber', form);
  const disabledSubmit =
    inProgress || submitting || hasValidationErrors || pristine;

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.fieldWrapper}>
        <FieldTextInputComponent
          id={`name`}
          name="name"
          label="Họ và tên"
          input={name.input}
          meta={name.meta}
          className={css.fieldInput}
        />
      </div>
      <div className={css.fieldWrapper}>
        <FieldTextInputComponent
          id={`email`}
          name="email"
          label="Email"
          onChange={(e: any) => e.preventDefault()}
          input={email.input}
          meta={email.meta}
          className={css.fieldInput}
        />
      </div>
      <div className={css.fieldWrapper}>
        <FieldTextInputComponent
          id={`phoneNumber`}
          name="phoneNumber"
          label="Số điện thoại"
          input={phoneNumber.input}
          meta={phoneNumber.meta}
          className={css.fieldInput}
        />
      </div>
      <FixedBottomButtons
        isAbsolute
        FirstButton={
          <Button
            type="submit"
            disabled={disabledSubmit}
            inProgress={inProgress}
            className={css.submitBtn}>
            Lưu thay đổi
          </Button>
        }
      />
    </Form>
  );
};

export default ProfileForm;
