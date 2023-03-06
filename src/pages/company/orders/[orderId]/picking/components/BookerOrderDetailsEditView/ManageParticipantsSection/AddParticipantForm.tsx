import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { emailFormatValid } from '@utils/validators';

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
  const {
    handleSubmit,
    hasSubmitButton,
    dirtySinceLastSubmit,
    submitErrors = {},
  } = props;

  const updateParticipantsInProgress = useAppSelector(
    (state) => state.OrderManagement.updateParticipantsInProgress,
  );

  const formClasses = classNames(css.root, {
    [css.withSubmitButton]: hasSubmitButton,
  });

  useEffect(() => {}, []);

  return (
    <Form onSubmit={handleSubmit} className={formClasses}>
      <div className={css.formContainer}>
        <FieldTextInput
          className={css.emailField}
          name="email"
          disabled={updateParticipantsInProgress}
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
      </div>
      <RenderWhen
        condition={!dirtySinceLastSubmit && !isEmpty(submitErrors?.email)}>
        <div className={css.error}>{submitErrors?.email}</div>
      </RenderWhen>
    </Form>
  );
};

const AddParticipantForm: React.FC<TAddParticipantFormProps> = (props) => {
  return <FinalForm {...props} component={AddParticipantFormComponent} />;
};

export default AddParticipantForm;
