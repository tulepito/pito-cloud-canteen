import { useIntl } from 'react-intl';
import classNames from 'classnames';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { nutritionOptions } from '@src/marketplaceConfig';

import css from './NutritionField.module.scss';

type NutritionFieldProps = {
  title?: string;
  titleClassName?: string;
  fieldClassName?: string;
  options?: { key: string; label: string }[];
  disabled?: boolean;
};

const NutritionField: React.FC<NutritionFieldProps> = (props) => {
  const {
    title,
    titleClassName,
    fieldClassName,
    options,
    disabled = false,
  } = props;
  const intl = useIntl();

  return (
    <div className={css.container}>
      {title && (
        <div className={classNames(css.fieldTitle, titleClassName)}>
          {intl.formatMessage({ id: 'NutritionField.title' })}
        </div>
      )}
      <div className={classNames(css.fieldGroups, fieldClassName)}>
        {(options || nutritionOptions).map(({ key, label }) => (
          <FieldCheckbox
            disabled={disabled}
            key={key}
            id={`nutritions-${key}`}
            name="nutritions"
            value={key}
            label={label}
            className={css.field}
          />
        ))}
      </div>
    </div>
  );
};
export default NutritionField;
