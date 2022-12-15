import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import React from 'react';

import css from './ToggleButton.module.scss';

type TToggleButtonProps = {
  defaultValue?: boolean;
  className?: string;
  onClick: (e: boolean) => void;
  disabled?: boolean;
};

const ToggleButton: React.FC<TToggleButtonProps> = (props) => {
  const { defaultValue, className, onClick, disabled } = props;

  const { value, toggle } = useBoolean(defaultValue);

  const toggleClasses = classNames(css.root, className, {
    [css.disabledButton]: disabled,
  });

  const onClickToggleButton = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    onClick(checked);
    toggle();
  };

  return (
    <div className={toggleClasses}>
      <input
        type="checkbox"
        checked={value}
        name="toggle"
        id="toggle"
        onChange={onClickToggleButton}
        disabled={disabled}
      />
      <label htmlFor="toggle" className={css.slider}></label>
    </div>
  );
};

export default ToggleButton;
