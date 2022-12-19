import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import React from 'react';

import css from './ToggleButton.module.scss';

type TToggleButtonProps = {
  name: string;
  id: string;
  defaultValue?: boolean;
  className?: string;
  onClick: (e: boolean) => void;
  disabled?: boolean;
};

const ToggleButton: React.FC<TToggleButtonProps> = (props) => {
  const { defaultValue, className, onClick, disabled, name, id } = props;

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
        name={name}
        id={id}
        onChange={onClickToggleButton}
        disabled={disabled}
      />
      <label htmlFor={id} className={css.slider}></label>
    </div>
  );
};

export default ToggleButton;
