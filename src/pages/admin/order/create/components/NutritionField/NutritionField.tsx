import { useIntl } from 'react-intl';
import classNames from 'classnames';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { nutritionOptions } from '@src/marketplaceConfig';

import css from './NutritionField.module.scss';

type NutritionFieldProps = {
  title?: string;
  titleClassName?: string;
  fieldClassName?: string;
};

const NutritionField: React.FC<NutritionFieldProps> = (props) => {
  const { title, titleClassName, fieldClassName } = props;
  const intl = useIntl();
  return (
    <div className={css.container}>
      {title && (
        <div className={classNames(css.fieldTitle, titleClassName)}>
          {intl.formatMessage({ id: 'NutritionField.title' })}
        </div>
      )}
      <div className={classNames(css.fieldGroups, fieldClassName)}>
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
