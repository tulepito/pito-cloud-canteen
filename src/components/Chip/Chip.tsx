import React from 'react';
import classNames from 'classnames';

import css from './Chip.module.scss';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  label: string;
  className?: string;
  labelClassName?: string;
}

const Chip: React.FC<ChipProps> = (props) => {
  const { selected, className, label, labelClassName, ...divProps } = props;

  const chipContainerClassName = classNames(css.container, className, {
    [css.selected]: selected,
  });

  const chipLabelClassName = classNames(css.label, labelClassName);

  return (
    <div className={chipContainerClassName} {...divProps}>
      <div className={chipLabelClassName}>{label}</div>
    </div>
  );
};

export default Chip;
