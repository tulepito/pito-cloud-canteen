import { Field } from 'react-final-form';
import classNames from 'classnames';

import css from './FieldLabelCheckbox.module.scss';

type TFieldLabelCheckboxProps = {
  name: string;
  options: {
    key: string;
    label: string;
  }[];
  containerClassName?: string;
};
const FieldLabelCheckbox: React.FC<TFieldLabelCheckboxProps> = (props) => {
  const { name, options, containerClassName } = props;
  const containerClasses = classNames(css.container, containerClassName);

  return (
    <div className={containerClasses}>
      {options.map(({ key, label }) => {
        return (
          <div key={key}>
            <Field
              id={`${name}-${key}`}
              name={name}
              type="checkbox"
              value={key}
              className={css.input}
              component="input"
            />
            <label htmlFor={`${name}-${key}`} className={css.label}>
              {label}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default FieldLabelCheckbox;
