import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import { addressRequired } from '@utils/validators';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './DeliveryAddressField.module.scss';

type DeliveryAddressFieldProps = {
  title?: string;
  containerClassName?: string;
};
const DeliveryAddressField: React.FC<DeliveryAddressFieldProps> = (props) => {
  const { title, containerClassName } = props;
  const intl = useIntl();
  const deliveryAddressRequiredMessage = intl.formatMessage({
    id: 'DeliveryAddressField.title',
  });
  const containerClasses = classNames(css.container, containerClassName);
  return (
    <div className={containerClasses}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <LocationAutocompleteInputField
        id="deliveryAddress"
        name="deliveryAddress"
        rootClassName={css.field}
        label={intl.formatMessage({
          id: 'DeliveryAddressField.deliveryAddress.label',
        })}
        placeholder={intl.formatMessage({
          id: 'EditCompanyForm.addressPlaceholder',
        })}
        validate={addressRequired(deliveryAddressRequiredMessage)}
      />
      <FieldTextInput
        id="detailAddress"
        name="detailAddress"
        rootClassName={css.field}
        label={intl.formatMessage({
          id: 'DeliveryAddressField.detailAddress.label',
        })}
        placeholder={intl.formatMessage({
          id: 'DeliveryAddressField.detailAddress.placeholder',
        })}
      />
    </div>
  );
};
export default DeliveryAddressField;
