import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';

import Toggle from '@components/Toggle/Toggle';

import css from './FoodPickingField.module.scss';

const FoodPickingField = () => {
  const intl = useIntl();
  return (
    <div className={css.container}>
      <div className={css.fieldTitle}>
        {intl.formatMessage({ id: 'FoodPickingField.title' })}
      </div>
      <div className={css.fieldGroups}>
        <Field id="pickAllow" name="pickAllow">
          {(props) => {
            const { id, input } = props;
            return (
              <Toggle
                label={intl.formatMessage({
                  id: 'FoodPickingField.pickAllow',
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
export default FoodPickingField;
