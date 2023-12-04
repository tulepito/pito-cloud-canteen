import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';

import useBoolean from '@hooks/useBoolean';

import css from './Toggle.module.scss';

type TToggleProps = {
  disabled?: boolean;
  status?: 'on' | 'off';
  onClick?: (value: boolean) => void;
  className?: string;
  label?: ReactNode;
  id?: string;
  name?: string;
};

const Toggle: React.FC<TToggleProps> = (props) => {
  const {
    disabled = false,
    status = 'on',
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
    if (onClick) {
      onClick(!switchControl.value);
    }

    switchControl.toggle();
  };

  useEffect(() => {
    if (status === 'on') {
      switchControl.setTrue();
    } else if (status === 'off') {
      switchControl.setFalse();
    }
  }, [status, switchControl]);

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
          checked={switchControl.value}
          disabled={disabled}
          onChange={() => null}
          // defaultChecked={switchControl.value}
        />
        <label
          htmlFor={id || 'toggle'}
          className={toggleClasses}
          onClick={onFieldSwitchChange}
        />
      </div>
    </div>
  );
};

export default Toggle;
