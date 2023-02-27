import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import React from 'react';

import css from './ToggleButton.module.scss';

type TToggleButtonProps = {
  name: string;
  id: string;
  defaultValue?: boolean;
  className?: string;
  onClick?: (e: boolean) => void;
  disabled?: boolean;
  label?: string;
  uncontrolledValue?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ToggleButton: React.FC<TToggleButtonProps> = (props) => {
  const {
    defaultValue,
    className,
    onClick,
    disabled,
    name,
    id,
    label,
    uncontrolledValue,
    onChange,
  } = props;

  const { value, toggle } = useBoolean(defaultValue);

  const toggleClasses = classNames(css.root, className, {
    [css.disabledButton]: disabled,
  });

  const onClickToggleButton = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    if (onClick) {
      onClick(checked);
    }
    toggle();
  };

  const isUncontrolled = typeof uncontrolledValue !== 'undefined';

  return (
    <div className={toggleClasses}>
      <div className={css.toggle}>
        <input
          type="checkbox"
          checked={isUncontrolled ? uncontrolledValue : value}
          name={name}
          id={id}
          onChange={isUncontrolled ? onChange : onClickToggleButton}
          disabled={disabled}
        />
        <label htmlFor={id} className={css.slider}></label>
      </div>
      {label && <label>{label}</label>}
    </div>
  );
};

export default ToggleButton;
