import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Toggle from '@components/Toggle/Toggle';
import { required } from '@utils/validators';
import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './PerPackageField.module.scss';

const PerPackageField = () => {
  const intl = useIntl();
  const perPackRequiredMessage = intl.formatMessage({
    id: 'PerPackageField.perPackRequired',
  });
  return (
    <div className={css.container}>
      <div className={css.fieldTitle}>
        {intl.formatMessage({ id: 'PerPackageField.title' })}
      </div>
      <div className={css.fieldGroup}>
        <FieldTextInput
          id="perPack"
          name="perPack"
          label={intl.formatMessage({
            id: 'PerPackageField.label',
          })}
          placeholder={intl.formatMessage({
            id: 'PerPackageField.placeholder',
          })}
          type="number"
          className={css.numberInput}
          // rightIcon={<div className={css.vndIcon}>đ</div>}
          validate={required(perPackRequiredMessage)}
        />

        <Field id="vatAllow" name="vatAllow">
          {(props) => {
            const { id, input } = props;
            return (
              <Toggle
                label={intl.formatMessage({
                  id: 'PerPackageField.vat',
                })}
                id={id}
                name={input.name}
                status="on"
                onClick={(value) => {
                  input.onChange(value);
                }}
                className={css.toggle}
              />
            );
          }}
        </Field>
      </div>
    </div>
  );
};
export default PerPackageField;
