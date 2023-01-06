import classNames from 'classnames';
import React from 'react';
import { Field } from 'react-final-form';

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
        preserveAspectRatio="none"
        width="14"
        height="14"
        className={className}
        xmlns="http://www.w3.org/2000/svg">
        <circle
          className={props.showAsRequired ? css.required : css.notChecked}
          cx="5"
          cy="19"
          r="6"
          transform="translate(2 -12)"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        />

        <g
          className={classNames(
            css.checked,
            checkedClassName || css.checkedStyle,
          )}
          transform="translate(2 -12)"
          fill="none"
          fillRule="evenodd">
          <circle strokeWidth="1" cx="5" cy="19" r="6" />
          <circle fillRule="nonzero" cx="5" cy="19" r="3" />
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
