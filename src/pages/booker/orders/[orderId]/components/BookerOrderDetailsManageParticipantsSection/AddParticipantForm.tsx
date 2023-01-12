import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { emailFormatValid } from '@utils/validators';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './AddParticipantForm.module.scss';

export type TAddParticipantFormValues = {
  email: string;
};

type TExtraProps = {
  hasSubmitButton?: boolean;
};
type TAddParticipantFormComponentProps =
  FormRenderProps<TAddParticipantFormValues> & Partial<TExtraProps>;
type TAddParticipantFormProps = FormProps<TAddParticipantFormValues> &
  TExtraProps;

const AddParticipantFormComponent: React.FC<
  TAddParticipantFormComponentProps
> = (props) => {
  const intl = useIntl();
  const { handleSubmit, hasSubmitButton } = props;

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <FieldTextInput
        className={css.emailField}
        name="email"
        placeholder={intl.formatMessage({
          id: 'AddParticipantForm.email.placeholder',
        })}
        validate={emailFormatValid(
          intl.formatMessage({ id: 'AddParticipantForm.email.invalid' }),
        )}
      />
      {hasSubmitButton && (
        <Button className={css.submitButton}>
          {intl.formatMessage({ id: 'AddParticipantForm.submitButtonText' })}
        </Button>
      )}
    </Form>
  );
};

const AddParticipantForm: React.FC<TAddParticipantFormProps> = (props) => {
  return <FinalForm {...props} component={AddParticipantFormComponent} />;
};

export default AddParticipantForm;
