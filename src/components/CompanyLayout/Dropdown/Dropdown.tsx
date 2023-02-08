import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { USER } from '@utils/data';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { shallowEqual } from 'react-redux';

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
  const router = useRouter();
  const { companyId } = router.query;
  const {
    value: isDropdownOpen,
    setTrue: onDropdownOpen,
    setFalse: onDropdowClose,
  } = useBoolean();
  const titleRef = useRef(selectedValue.label || options[0].label);
  const companyRefs = useAppSelector(
    (state) => state.ManageCompaniesPage.companyRefs,
    shallowEqual,
  );
  useEffect(() => {
    if (companyId) {
      const currentCompany = companyRefs.find(
        (_company) => USER(_company).getId() === companyId,
      );
      setSelectedValue({
        value: USER(currentCompany).getId(),
        label: USER(currentCompany).getPublicData()?.companyName,
      });
      titleRef.current = USER(currentCompany).getPublicData()?.companyName;
    }
  }, [companyId, companyRefs, setSelectedValue]);

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
