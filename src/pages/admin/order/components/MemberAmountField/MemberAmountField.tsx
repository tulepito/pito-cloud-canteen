import { useIntl } from 'react-intl';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { addCommas, removeNonNumeric } from '@helpers/format';
import {
  composeValidators,
  nonNegativeValue,
  required,
} from '@utils/validators';

import css from './MemberAmountField.module.scss';

const Amount = () => {
  return <div className={css.label}>người</div>;
};

type MemberAmountFieldProps = {
  title?: string;
  disabled?: boolean;
};

const MemberAmountField: React.FC<MemberAmountFieldProps> = (props) => {
  const { title, disabled = false } = props;
  const intl = useIntl();
  const perPackRequiredMessage = intl.formatMessage({
    id: 'MemberAmountField.memberAmount.required',
  });
  const perPackNonNegativeMessage = intl.formatMessage({
    id: 'MemberAmountField.memberAmount.nonNegative',
  });
  const parseNumber = (value: string) => {
    return addCommas(removeNonNumeric(value));
  };

  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <div className={css.fieldGroup}>
        <FieldTextInput
          id="memberAmount"
          name="memberAmount"
          label={intl.formatMessage({
            id: 'MemberAmountField.memberAmount.label',
          })}
          parse={parseNumber}
          placeholder={intl.formatMessage({
            id: 'MemberAmountField.memberAmount.placeholder',
          })}
          type="text"
          className={css.numberInput}
          rightIcon={<Amount />}
          rightIconContainerClassName={css.amountLabel}
          disabled={disabled}
          validate={composeValidators(
            required(perPackRequiredMessage),
            nonNegativeValue(perPackNonNegativeMessage),
          )}
        />
      </div>
    </div>
  );
};
export default MemberAmountField;
