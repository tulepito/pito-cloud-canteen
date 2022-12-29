import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import { useIntl } from 'react-intl';

import css from './DeliveryAddressField.module.scss';

const DeliveryAddressField = () => {
  const intl = useIntl();
  return (
    <div className={css.container}>
      <LocationAutocompleteInputField
        id="location"
        name="location"
        rootClassName={css.field}
        label={intl.formatMessage({
          id: 'EditCompanyForm.addressLabel',
        })}
        placeholder={intl.formatMessage({
          id: 'EditCompanyForm.addressPlaceholder',
        })}
      />
    </div>
  );
};
export default DeliveryAddressField;
