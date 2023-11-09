import React from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import css from './FieldRadioButton.module.scss';

type TIconRadioButton = {
  className?: string;
  checkedClassName?: string;
  showAsRequired?: boolean;
};

export const IconRadioButton: React.FC<TIconRadioButton> = (props) => {
  const { checkedClassName, className } = props;

  return (
    <div>
      <svg
        width={20}
        height={20}
        className={className}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect
          x="0.5"
          y="0.5"
          width={19}
          height={19}
          rx="9.5"
          fill="white"
          stroke="#262626"
        />
        <g
          className={classNames(
            css.checked,
            checkedClassName || css.checkedStyle,
          )}
          transform="translate(0 -10)"
          fill="none"
          fillRule="evenodd">
          <circle fillRule="nonzero" cx="10" cy="20" r="6" />
        </g>
      </svg>
    </div>
  );
};

const FieldRadioButton = (props: any) => {
  const {
    rootClassName,
    className,
    svgClassName,
    checkedClassName,
    id,
    label,
    showAsRequired,
    radioButtonWrapperClassName,
    radioLabelClassName,
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const labelClasses = classNames(css.label, radioLabelClassName);
  const radioButtonWrapperClasses = classNames(
    css.radioButtonWrapper,
    radioButtonWrapperClassName,
  );
  const radioButtonProps = {
    id,
    className: css.input,
    component: 'input',
    type: 'radio',
    ...rest,
  };

  return (
    <span className={classes}>
      <Field {...radioButtonProps} />
      <label htmlFor={id} className={labelClasses}>
        <span className={radioButtonWrapperClasses}>
          <IconRadioButton
            className={svgClassName}
            checkedClassName={checkedClassName}
            showAsRequired={showAsRequired}
          />
        </span>
        <span className={css.text}>{label}</span>
      </label>
    </span>
  );
};

export default FieldRadioButton;
