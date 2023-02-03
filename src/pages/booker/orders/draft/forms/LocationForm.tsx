import Button from '@components/Button/Button';
import { FieldTextAreaComponent } from '@components/FormFields/FieldTextArea/FieldTextArea';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './LocationForm.module.scss';

type TLocationFormProps = {
  onSubmit: (values: TLocationFormValues) => void;
  initialValues?: TLocationFormValues;
};

export type TLocationFormValues = {
  address: string;
};

const validate = (values: TLocationFormValues) => {
  const errors: any = {};
  if (!values.address) {
    errors.address = 'Required';
  }
  return errors;
};

const LocationForm: React.FC<TLocationFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TLocationFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const address = useField('address', form);
  const disabledSubmit = submitting || hasValidationErrors;

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldTextAreaComponent
        className={css.inputWrapper}
        inputClassName={css.input}
        id="address"
        meta={address.meta}
        input={address.input}
        rows={3}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.address',
        })}
      />
      <Button className={css.submitBtn} disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default LocationForm;
