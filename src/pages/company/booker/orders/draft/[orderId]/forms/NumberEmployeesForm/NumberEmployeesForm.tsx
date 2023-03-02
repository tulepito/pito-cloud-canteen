import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './NumberEmployeesForm.module.scss';

type TNumberEmployeesFormProps = {
  onSubmit: (values: TNumberEmployeesFormValues) => void;
  initialValues?: TNumberEmployeesFormValues;
  loading?: boolean;
};

export type TNumberEmployeesFormValues = {
  memberAmount: number;
};

const validate = (values: TNumberEmployeesFormValues) => {
  const errors: any = {};
  if (!values.memberAmount) {
    errors.memberAmount = 'Vui lòng chọn số lượng nhân viên';
  }
  return errors;
};

const NumberEmployeesForm: React.FC<TNumberEmployeesFormProps> = ({
  onSubmit,
  initialValues,
  loading,
}) => {
  const onSubmitInternal = (values: TNumberEmployeesFormValues) => {
    onSubmit({
      memberAmount: Number(values.memberAmount),
    });
  };

  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TNumberEmployeesFormValues>({
      onSubmit: onSubmitInternal,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const memberAmount = useField('memberAmount', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit = pristine || submitInprogress || hasValidationErrors;

  const rightIcon = (
    <span>
      <span className={css.rightIcon}>
        {intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.memberAmount.unit',
        })}
      </span>
    </span>
  );

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldTextInputComponent
        className={css.inputWrapper}
        id="memberAmount"
        name="memberAmount"
        input={memberAmount.input}
        meta={memberAmount.meta}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.memberAmount',
        })}
        rightIconContainerClassName={css.rightIconContainer}
        rightIcon={rightIcon}
      />
      <Button
        className={css.submitBtn}
        inProgress={submitInprogress}
        disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default NumberEmployeesForm;
