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
import { useViewport } from '@hooks/useViewport';
import { emailFormatValid } from '@utils/validators';

import css from './AddParticipantForm.module.scss';

export type TAddParticipantFormValues = {
  email: string;
};

type TExtraProps = {
  id: string;
  hasSubmitButton?: boolean;
  ableToUpdateOrder: boolean;
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
    id,
    handleSubmit,
    hasSubmitButton,
    dirtySinceLastSubmit,
    submitErrors = {},
    form,
    ableToUpdateOrder,
  } = props;
  const { isMobileLayout } = useViewport();
  const updateParticipantsInProgress = useAppSelector(
    (state) => state.OrderManagement.updateParticipantsInProgress,
  );

  const formClasses = classNames(css.formContainer, {
    [css.withSubmitButton]: hasSubmitButton,
  });

  const fieldProps = {
    disabled: updateParticipantsInProgress || !ableToUpdateOrder,
    placeholder: isMobileLayout
      ? intl.formatMessage({
          id: 'AddParticipantForm.mobile.email.placeholder',
        })
      : intl.formatMessage({
          id: 'AddParticipantForm.email.placeholder',
        }),
    validate: emailFormatValid(
      intl.formatMessage({ id: 'AddParticipantForm.email.invalid' }),
    ),
  };

  const customHandleSubmit = async (event: any) => {
    const errors = await handleSubmit(event);

    if (isEmpty(errors?.email)) {
      form.reset();
    }
  };

  return (
    <Form id={id} onSubmit={customHandleSubmit} className={css.root}>
      <div className={formClasses}>
        <FieldTextInput
          className={css.emailField}
          name="email"
          {...fieldProps}
        />
        {hasSubmitButton && (
          <Button disabled={!ableToUpdateOrder} className={css.submitButton}>
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
