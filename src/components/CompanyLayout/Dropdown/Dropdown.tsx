import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import useBoolean from '@hooks/useBoolean';
import { useRef } from 'react';

import css from './Dropdown.module.scss';

type DropdownProps = {
  options: {
    value: string;
    label: string;
  }[];
  selectedValue: { value?: string; label?: string };
  setSelectedValue: (value: any) => void;
};
const Dropdown: React.FC<DropdownProps> = (props) => {
  const { options, selectedValue, setSelectedValue } = props;
  const {
    value: isDropdownOpen,
    setTrue: onDropdownOpen,
    setFalse: onDropdowClose,
  } = useBoolean();

  const titleRef = useRef(selectedValue.label || options[0].label);

  return (
    <OutsideClickHandler
      className={css.wrapper}
      onOutsideClick={onDropdowClose}>
      <div className={css.selectedItem} onMouseEnter={onDropdownOpen}>
        {titleRef.current}
      </div>

      {isDropdownOpen && (
        <div className={css.dropdown}>
          {options.map(({ label, value }) => {
            const handleMouseEnter = () => {
              setSelectedValue({ value, label });
            };
            const handleMouseClick = () => {
              titleRef.current = label;
              onDropdowClose();
            };
            return (
              <div
                className={css.item}
                key={value}
                onMouseEnter={handleMouseEnter}
                onClick={handleMouseClick}>
                {label}
              </div>
            );
          })}
        </div>
      )}
    </OutsideClickHandler>
  );
};

export default Dropdown;
