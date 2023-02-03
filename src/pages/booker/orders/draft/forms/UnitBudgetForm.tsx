import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import Toggle from '@components/Toggle/Toggle';
import { addCommas, removeNonNumeric } from '@helpers/format';
import { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './UnitBudgetForm.module.scss';

const VNDIcon = () => {
  return <div className={css.vndIcon}>đ</div>;
};

type TUnitBudgetFormProps = {
  onSubmit: (values: TUnitBudgetFormValues) => void;
  initialValues?: TUnitBudgetFormValues;
};

export type TUnitBudgetFormValues = {
  packagePerMember: string;
  vatAllow: boolean;
};

const validate = (values: TUnitBudgetFormValues) => {
  const errors: any = {};
  if (!values.packagePerMember) {
    errors.packagePerMember = 'Required';
  }
  return errors;
};

const UnitBudgetForm: React.FC<TUnitBudgetFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TUnitBudgetFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const packagePerMember = useField('packagePerMember', form);
  const vatAllow = useField('vatAllow', form);
  const disabledSubmit = submitting || hasValidationErrors;

  const parseThousandNumber = (value: string) => {
    return addCommas(removeNonNumeric(value));
  };

  useEffect(() => {
    form.change(
      'packagePerMember',
      parseThousandNumber(packagePerMember.input.value),
    );
  }, [packagePerMember.input.value]);

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldTextInputComponent
        id="packagePerMember"
        name="packagePerMember"
        input={packagePerMember.input}
        meta={packagePerMember.meta}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.packagePerMember',
        })}
        parse={parseThousandNumber}
        placeholder={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.price.placeholder',
        })}
        type="text"
        className={css.numberInput}
        rightIcon={<VNDIcon />}
      />
      <div className={css.minPriceNote}>
        <FormattedMessage id="Booker.CreateOrder.Form.field.price.minPrice" />
      </div>
      <Toggle
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.price.vat',
        })}
        id={vatAllow.input.name}
        name={vatAllow.input.name}
        status={vatAllow.input.value ? 'on' : 'off'}
        onClick={(value) => {
          vatAllow.input.onFocus();
          vatAllow.input.onChange(value);
          vatAllow.input.onBlur();
        }}
        className={css.toggle}
      />
      <Button className={css.submitBtn} disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default UnitBudgetForm;
