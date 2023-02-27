import IconArrow from '@components/Icons/IconArrow/IconArrow';
import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import css from './SortingDropdown.module.scss';

type SortingDropdownProps = {
  selectedValue: any;
  onOptionChange: (value: any) => void;
};
const SortingDropdown: React.FC<SortingDropdownProps> = (props) => {
  const { onOptionChange, selectedValue } = props;
  const {
    value: isDropdownOpen,
    setTrue: onDropdownOpen,
    setFalse: onDropdowClose,
  } = useBoolean();

  const intl = useIntl();
  const sortingOptions = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: 'BookerSelectRestaurant.sortOption.favorite',
        }),
        value: 'favorite',
      },
      {
        label: intl.formatMessage({
          id: 'BookerSelectRestaurant.sortOption.newest',
        }),
        value: 'newest',
      },
      {
        label: intl.formatMessage({
          id: 'BookerSelectRestaurant.sortOption.mostOrder',
        }),
        value: 'mostOrder',
      },
    ];
  }, [intl]);

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
        {sortingOptions.map((option) => (
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
