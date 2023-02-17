import IconArrow from '@components/Icons/IconArrow/IconArrow';
import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';

import css from './SortingDropdown.module.scss';

type SortingDropdownProps = {
  options: {
    label: string;
    value: string;
  }[];
  selectedValue: any;
  onOptionChange: (value: any) => void;
};
const SortingDropdown: React.FC<SortingDropdownProps> = (props) => {
  const { options, onOptionChange, selectedValue } = props;
  const {
    value: isDropdownOpen,
    setTrue: onDropdownOpen,
    setFalse: onDropdowClose,
  } = useBoolean();

  const dropdownClasses = classNames(css.optionsWrapper, {
    [css.open]: isDropdownOpen,
  });

  const onOptionClick = (value: any) => () => {
    onOptionChange(value);
    onDropdowClose();
  };

  return (
    <div
      className={css.container}
      onMouseEnter={onDropdownOpen}
      onMouseLeave={onDropdowClose}>
      <div className={css.selectedValue}>
        <span>{selectedValue}</span>
        <IconArrow direction="down" />
      </div>
      <div className={dropdownClasses}>
        {options.map((option) => (
          <div
            className={css.option}
            onClick={onOptionClick(option.value)}
            key={option.value}>
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortingDropdown;
