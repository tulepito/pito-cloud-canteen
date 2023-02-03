import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { useIntl } from 'react-intl';

import css from './NutritionField.module.scss';

type NutritionFieldProps = {
  title?: string;
};

const nutritionOptions = [
  { key: 'vegetarian', label: 'Nutrition.vegetarian' },
  { key: 'noGluten', label: 'Nutrition.noGluten' },
  { key: 'keto', label: 'Nutrition.keto' },
];
const NutritionField: React.FC<NutritionFieldProps> = (props) => {
  const { title } = props;
  const intl = useIntl();
  return (
    <div className={css.container}>
      {title && (
        <div className={css.fieldTitle}>
          {intl.formatMessage({ id: 'NutritionField.title' })}
        </div>
      )}
      <div className={css.fieldGroups}>
        {nutritionOptions.map(({ key, label }) => (
          <FieldCheckbox
            key={key}
            id={`nutritions-${key}`}
            name="nutritions"
            value={key}
            label={intl.formatMessage({ id: label })}
          />
        ))}
      </div>
    </div>
  );
};
export default NutritionField;
