import { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import FieldPackagePerMemer from '@components/FieldPackagePerMemer/FieldPackagePerMemer';
import { addCommas, removeNonNumeric } from '@helpers/format';

import css from './UnitBudgetForm.module.scss';

type TUnitBudgetFormProps = {
  onSubmit: (values: TUnitBudgetFormValues) => void;
  initialValues?: TUnitBudgetFormValues;
  loading?: boolean;
};

export type TUnitBudgetFormValues = {
  packagePerMember: number | string;
};

const validate = (values: TUnitBudgetFormValues) => {
  const errors: any = {};
  if (!values.packagePerMember) {
    errors.packagePerMember = 'Vui lòng nhập ngân sách';
  }

  return errors;
};

const UnitBudgetForm: React.FC<TUnitBudgetFormProps> = ({
  onSubmit,
  initialValues,
  loading,
}) => {
  const onSubmitInternal = (values: TUnitBudgetFormValues) => {
    onSubmit({
      packagePerMember: +`${values.packagePerMember}`.replace(/,/g, ''),
    });
  };
  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TUnitBudgetFormValues>({
      onSubmit: onSubmitInternal,
      validate,
      initialValues,
    });
  const intl = useIntl();

  const packagePerMember = useField('packagePerMember', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit = pristine || submitInprogress || hasValidationErrors;

  const parseThousandNumber = (value: string) => {
    return addCommas(removeNonNumeric(value));
  };

  useEffect(() => {
    if (packagePerMember.input.value) {
      form.change(
        'packagePerMember',
        parseThousandNumber(`${packagePerMember.input.value}`),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packagePerMember.input.value]);

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldPackagePerMemer
        form={form}
        tooltipOverlayClassName={css.tooltipOverlay}
        id="packagePerMember"
        name="packagePerMember"
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.packagePerMember',
        })}
        placeholder={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.price.placeholder',
        })}
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

export default UnitBudgetForm;
