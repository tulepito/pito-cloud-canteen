import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { useIntl } from 'react-intl';

import css from './NutritionField.module.scss';

const NutritionField = () => {
  const intl = useIntl();
  return (
    <div className={css.container}>
      <div className={css.fieldTitle}>
        {intl.formatMessage({ id: 'NutritionField.title' })}
      </div>
      <div className={css.fieldGroups}>
        <FieldCheckbox
          id="anchay"
          name="nutrition"
          value="anchay"
          label="anchay"
        />
        <FieldCheckbox
          id="nogluten"
          name="nutrition"
          value="nogluten"
          label="no gluten"
        />
      </div>
    </div>
  );
};
export default NutritionField;
