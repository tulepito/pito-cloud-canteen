import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';

import css from './FieldRating.module.scss';

type TFieldRatingProps = {
  name: string;
  containerClassName?: string;
  iconClassName?: string;
  optionClassName?: string;
  labelClassName?: string;
  titleShowed?: boolean;
};

const ratingOptions = [1, 2, 3, 4, 5];

const FieldRating: React.FC<TFieldRatingProps> = (props) => {
  const {
    name,
    containerClassName,
    iconClassName,
    optionClassName,
    labelClassName,
    titleShowed = true,
  } = props;
  const intl = useIntl();

  const containerClasses = classNames(css.container, containerClassName);
  const labelClasses = classNames(css.label, labelClassName);

  return (
    <div className={containerClasses}>
      {ratingOptions.map((rating) => {
        return (
          <div
            className={classNames(optionClassName, css.option)}
            key={`${name}-${rating}`}>
            <Field
              id={`${name}-${rating}`}
              name={name}
              type="radio"
              value={`${rating}`}
              className={css.input}
              component="input"
            />
            <label className={labelClasses} htmlFor={`${name}-${rating}`}>
              <IconRatingFace className={iconClassName} rating={rating} />

              <span
                className={classNames({
                  [css.labelText]: !titleShowed,
                })}>
                {intl.formatMessage({ id: `FieldRating.label.${rating}` })}
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default FieldRating;
