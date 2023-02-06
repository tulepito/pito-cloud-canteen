import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './NumberEmployeesForm.module.scss';

type TNumberEmployeesFormProps = {
  onSubmit: (values: TNumberEmployeesFormValues) => void;
  initialValues?: TNumberEmployeesFormValues;
};

export type TNumberEmployeesFormValues = {
  numberMembers: string;
};

const validate = (values: TNumberEmployeesFormValues) => {
  const errors: any = {};
  if (!values.numberMembers) {
    errors.numberMembers = 'Required';
  }
  return errors;
};

const NumberEmployeesForm: React.FC<TNumberEmployeesFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TNumberEmployeesFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const numberMembers = useField('numberMembers', form);
  const disabledSubmit = submitting || hasValidationErrors;

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldTextInputComponent
        className={css.inputWrapper}
        id="numberMembers"
        name="numberMembers"
        input={numberMembers.input}
        meta={numberMembers.meta}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.numberMembers',
        })}
        rightIconContainerClassName={css.rightIconContainer}
        rightIcon={
          <span className={css.rightIcon}>
            {intl.formatMessage({
              id: 'Booker.CreateOrder.Form.field.numberMembers.unit',
            })}
          </span>
        }
      />
      <Button className={css.submitBtn} disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default NumberEmployeesForm;
