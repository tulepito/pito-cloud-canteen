import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';

import css from './FieldRating.module.scss';

type TFieldRatingProps = {
  name: string;
  containerClassName?: string;
  iconClassName?: string;
};

const ratingOptions = [1, 2, 3, 4, 5];

const FieldRating: React.FC<TFieldRatingProps> = (props) => {
  const { name, containerClassName, iconClassName } = props;
  const intl = useIntl();

  const containerClasses = classNames(css.container, containerClassName);

  return (
    <div className={containerClasses}>
      {ratingOptions.map((rating) => (
        <div className={css.option} key={`${name}-${rating}`}>
          <Field
            id={`${name}-${rating}`}
            name={name}
            type="radio"
            value={`${rating}`}
            className={css.input}
            component="input"
          />
          <label className={css.label} htmlFor={`${name}-${rating}`}>
            <IconRatingFace className={iconClassName} rating={rating} />
            <span>
              {intl.formatMessage({ id: `FieldRating.label.${rating}` })}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default FieldRating;
