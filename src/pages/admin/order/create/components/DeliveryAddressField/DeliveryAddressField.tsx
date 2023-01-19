import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import { addressRequired } from '@utils/validators';
import { useIntl } from 'react-intl';

import css from './DeliveryAddressField.module.scss';

type DeliveryAddressFieldProps = {
  title?: string;
};
const DeliveryAddressField: React.FC<DeliveryAddressFieldProps> = (props) => {
  const { title } = props;
  const intl = useIntl();
  const deliveryAddressRequiredMessage = intl.formatMessage({
    id: 'DeliveryAddressField.title',
  });
  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <LocationAutocompleteInputField
        id="deliveryAddress"
        name="deliveryAddress"
        rootClassName={css.field}
        placeholder={intl.formatMessage({
          id: 'EditCompanyForm.addressPlaceholder',
        })}
        validate={addressRequired(deliveryAddressRequiredMessage)}
      />
    </div>
  );
};
export default DeliveryAddressField;
