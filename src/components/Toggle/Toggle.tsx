import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import React from 'react';

import css from './Toggle.module.scss';

type TToggle = {
  disabled?: boolean;
  status: 'on' | 'off';
  onClick: (value: boolean) => void;
  className?: string;
};

const Toggle = (props: TToggle) => {
  const { disabled = false, status, onClick, className } = props;

  const switchControl = useBoolean(status === 'on');

  const onFieldSwitchChange = () => {
    if (disabled) {
      return;
    }
    switchControl.toggle();
    onClick(switchControl.value);
  };

  const switchClasses = classNames(css.switchInput);
  const labelClasses = classNames(css.switch, {
    [css.disabled]: disabled,
  });
  const classes = classNames(css.root, className);
  return (
    <div className={classes}>
      <input
        type="checkbox"
        className={switchClasses}
        id="toggle"
        name="toggle"
        disabled={disabled}
        checked={switchControl.value}
      />
      <label
        htmlFor="switch"
        className={labelClasses}
        onClick={onFieldSwitchChange}
      />
    </div>
  );
};

export default Toggle;
