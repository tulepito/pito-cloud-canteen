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
};

const ToggleButton: React.FC<TToggleButtonProps> = (props) => {
  const { defaultValue, className, onClick, disabled, name, id, label } = props;

  const { value, toggle } = useBoolean(defaultValue);

  const toggleClasses = classNames(css.root, className, {
    [css.disabledButton]: disabled,
  });

  const onClickToggleButton = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    onClick && onClick(checked);
    toggle();
  };

  return (
    <div className={toggleClasses}>
      <div className={css.toggle}>
        <input
          type="checkbox"
          checked={value}
          name={name}
          id={id}
          onChange={onClickToggleButton}
          disabled={disabled}
        />
        <label htmlFor={id} className={css.slider}></label>
      </div>
      {label && <label>{label}</label>}
    </div>
  );
};

export default ToggleButton;
