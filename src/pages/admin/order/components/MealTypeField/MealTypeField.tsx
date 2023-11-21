import { useIntl } from 'react-intl';
import classNames from 'classnames';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { mealTypeOptions } from '@src/marketplaceConfig';

import css from './MealTypeField.module.scss';

type MealTypeFieldProps = {
  title?: string;
  titleClassName?: string;
  fieldClassName?: string;
  options?: { key: string; label: string }[];
};

const MealTypeField: React.FC<MealTypeFieldProps> = (props) => {
  const { title, titleClassName, fieldClassName, options } = props;
  const intl = useIntl();

  return (
    <div className={css.container}>
      {title && (
        <div className={classNames(css.fieldTitle, titleClassName)}>
          {intl.formatMessage({ id: 'MealTypeField.title' })}
        </div>
      )}
      <div className={classNames(css.fieldGroups, fieldClassName)}>
        {(options || mealTypeOptions).map(({ key, label }) => (
          <FieldCheckbox
            key={key}
            id={`mealType-${key}`}
            name="mealType"
            value={key}
            label={label}
            className={css.field}
          />
        ))}
      </div>
    </div>
  );
};
export default MealTypeField;
