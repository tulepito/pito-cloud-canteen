import Button from '@components/Button/Button';
import { LocationAutocompleteInputComponent } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './LocationForm.module.scss';

type TLocationFormProps = {
  onSubmit: (values: TLocationFormValues) => void;
  initialValues?: TLocationFormValues;
  loading?: boolean;
};

export type TLocationFormValues = {
  deliveryAddress: any;
};

const validate = (values: TLocationFormValues) => {
  const errors: any = {};
  if (!values.deliveryAddress) {
    errors.deliveryAddress = 'Required';
  }
  return errors;
};

const LocationForm: React.FC<TLocationFormProps> = ({
  onSubmit,
  initialValues,
  loading,
}) => {
  const onSubmitInside = (values: TLocationFormValues) => {
    const {
      selectedPlace: { address, origin },
    } = values?.deliveryAddress || {};

    onSubmit({
      deliveryAddress: {
        address,
        origin: {
          lat: origin.lat,
          lng: origin.lng,
        },
      },
    });
  };

  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TLocationFormValues>({
      onSubmit: onSubmitInside,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const deliveryAddress = useField('deliveryAddress', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit =
    pristine || loading || submitting || hasValidationErrors;

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <LocationAutocompleteInputComponent
        className={css.inputWrapper}
        id="deliveryAddress"
        meta={deliveryAddress.meta}
        input={deliveryAddress.input}
        rows={3}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.address',
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

export default LocationForm;
