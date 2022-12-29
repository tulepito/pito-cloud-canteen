import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import { useIntl } from 'react-intl';

import css from './DeliveryAddressField.module.scss';

const DeliveryAddressField = () => {
  const intl = useIntl();
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
      />
    </div>
  );
};
export default DeliveryAddressField;
