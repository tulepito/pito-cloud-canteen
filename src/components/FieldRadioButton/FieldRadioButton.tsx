import classNames from 'classnames';
import React from 'react';
import { Field } from 'react-final-form';

import css from './FieldRadioButton.module.scss';

type TIconRadioButton = {
  className?: string;
  checkedClassName?: string;
  showAsRequired?: boolean;
};

const IconRadioButton: React.FC<TIconRadioButton> = (props) => {
  const { checkedClassName, className } = props;
  return (
    <div>
      <svg
        className={className}
        width="14"
        height="14"
        xmlns="http://www.w3.org/2000/svg">
        <circle
          className={props.showAsRequired ? css.required : css.notChecked}
          cx="5"
          cy="19"
          r="6"
          transform="translate(2 -12)"
          strokeWidth="2"
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
          <circle strokeWidth="2" cx="5" cy="19" r="6" />
          <circle fill="#FFF" fillRule="nonzero" cx="5" cy="19" r="3" />
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
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);
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
      <label htmlFor={id} className={css.label}>
        <span className={css.radioButtonWrapper}>
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
