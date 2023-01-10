import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import Toggle from '@components/Toggle/Toggle';
import { addCommas, removeNonNumeric } from '@helpers/format';
import {
  composeValidators,
  nonNegativeValue,
  required,
} from '@utils/validators';
import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './PerPackageField.module.scss';

const VNDIcon = () => {
  return <div className={css.vndIcon}>đ</div>;
};

type PerPackageFieldProps = {
  title?: string;
};

const PerPackageField: React.FC<PerPackageFieldProps> = (props) => {
  const { title } = props;
  const intl = useIntl();
  const perPackRequiredMessage = intl.formatMessage({
    id: 'PerPackageField.perPackRequired',
  });
  const perPackNonNegativeMessage = intl.formatMessage({
    id: 'PerPackageField.perPackNonNegative',
  });
  const parseThousandNumber = (value: string) => {
    return addCommas(removeNonNumeric(value));
  };
  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <div className={css.fieldGroup}>
        <FieldTextInput
          id="packagePerMember"
          name="packagePerMember"
          label={intl.formatMessage({
            id: 'PerPackageField.label',
          })}
          parse={parseThousandNumber}
          placeholder={intl.formatMessage({
            id: 'PerPackageField.placeholder',
          })}
          type="text"
          className={css.numberInput}
          rightIcon={<VNDIcon />}
          validate={composeValidators(
            required(perPackRequiredMessage),
            nonNegativeValue(perPackNonNegativeMessage),
          )}
        />

        <Field id="vatAllow" name="vatAllow">
          {(fieldProps) => {
            const { id, input } = fieldProps;
            return (
              <Toggle
                label={intl.formatMessage({
                  id: 'PerPackageField.vat',
                })}
                id={id}
                name={input.name}
                status={input.value ? 'on' : 'off'}
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
