import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import { required } from '@utils/validators';
import { useIntl } from 'react-intl';

import css from './DeliveryAddressField.module.scss';

const DeliveryAddressField = () => {
  const intl = useIntl();
  const deliveryAddressRequiredMessage = intl.formatMessage({
    id: 'DeliveryAddressField.title',
  });
  return (
    <div className={css.container}>
      <div className={css.fieldTitle}>
        {intl.formatMessage({ id: 'DeliveryAddressField.title' })}
      </div>
      <LocationAutocompleteInputField
        id="deliveryAddress"
        name="deliveryAddress"
        rootClassName={css.field}
        placeholder={intl.formatMessage({
          id: 'EditCompanyForm.addressPlaceholder',
        })}
        validate={required(deliveryAddressRequiredMessage)}
      />
    </div>
  );
};
export default DeliveryAddressField;
