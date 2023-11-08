import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';

import Toggle from '@components/Toggle/Toggle';

import css from './FoodPickingField.module.scss';

type TFoodPickingField = {
  disabled?: boolean;
};

const FoodPickingField: React.FC<TFoodPickingField> = ({
  disabled = false,
}) => {
  const intl = useIntl();

  return (
    <div className={css.container}>
      <div className={css.fieldTitle}>
        {intl.formatMessage({ id: 'FoodPickingField.title' })}
      </div>
      <div className={css.fieldGroups}>
        <Field id="pickAllow" name="pickAllow" disabled={disabled}>
          {(props) => {
            const { id, input } = props;

            return (
              <Toggle
                label={intl.formatMessage({
                  id: 'FoodPickingField.pickAllow',
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
export default FoodPickingField;
