import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import Toggle from '@components/Toggle/Toggle';
import { parseThousandNumber } from '@helpers/format';
import {
  composeValidators,
  greaterThanOneThousand,
  required,
} from '@utils/validators';

import css from './PerPackageField.module.scss';

const VNDIcon = () => {
  return <div className={css.vndIcon}>đ</div>;
};

type PerPackageFieldProps = {
  title?: string;
  disabled?: boolean;
};

const PerPackageField: React.FC<PerPackageFieldProps> = (props) => {
  const { title, disabled = false } = props;
  const intl = useIntl();
  const perPackRequiredMessage = intl.formatMessage({
    id: 'PerPackageField.perPackRequired',
  });
  const perPackGreaterThanOneThousandMessage = intl.formatMessage({
    id: 'PerPackageField.perPackGreaterThanOneThousand',
  });

  const handleParseNumber = (value: string) => {
    return parseThousandNumber(value);
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
          parse={handleParseNumber}
          placeholder={intl.formatMessage({
            id: 'PerPackageField.placeholder',
          })}
          type="text"
          className={css.numberInput}
          rightIcon={<VNDIcon />}
          disabled={disabled}
          validate={composeValidators(
            required(perPackRequiredMessage),
            greaterThanOneThousand(perPackGreaterThanOneThousandMessage),
          )}
        />

        <Field id="vatAllow" name="vatAllow" disabled={disabled}>
          {(fieldProps) => {
            const { id, input } = fieldProps;

            return (
              <Toggle
                label={intl.formatMessage({
                  id: 'PerPackageField.vat',
                })}
                id={id}
                name={input.name}
                disabled={disabled}
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
