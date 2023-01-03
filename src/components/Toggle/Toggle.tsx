import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import React from 'react';

import css from './Toggle.module.scss';

type TToggle = {
  disabled?: boolean;
  status: 'on' | 'off';
  onClick: (value: boolean) => void;
  className?: string;
  label?: string;
  id?: string;
  name?: string;
};

const Toggle = (props: TToggle) => {
  const {
    disabled = false,
    status,
    onClick,
    className,
    label,
    id,
    name,
  } = props;
  const switchControl = useBoolean(status === 'on');
  const onFieldSwitchChange = () => {
    if (disabled) {
      return;
    }
    onClick(!switchControl.value);
    switchControl.toggle();
  };

  const inputClasses = classNames(css.switchInput);
  const toggleClasses = classNames(css.switch, {
    [css.disabled]: disabled,
  });
  const classes = classNames(css.root, className);
  return (
    <div className={classes}>
      {label && <div className={css.toggleLabel}>{label}</div>}
      <div className={css.toggleContainer}>
        <input
          type="checkbox"
          className={inputClasses}
          id={id || 'toggle'}
          name={name || 'toggle'}
          disabled={disabled}
          defaultChecked={switchControl.value}
        />
        <label
          htmlFor={id}
          className={toggleClasses}
          onClick={onFieldSwitchChange}
        />
      </div>
    </div>
  );
};

export default Toggle;
