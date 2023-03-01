import Avatar from '@components/Avatar/Avatar';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';
import capitalize from 'lodash/capitalize';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { shallowEqual } from 'react-redux';

import css from './Dropdown.module.scss';

const getAbbreviatedName = (fullName: string) =>
  fullName
    .split(' ')
    .map((name) => capitalize(name[0]))
    .join('');

type DropdownProps = {
  options: {
    value: string;
    label: string;
    logo?: any;
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
    if (companyId && companyId !== 'personal') {
      const currentCompany = companyRefs.find(
        (_company) => User(_company).getId() === companyId,
      );
      setSelectedValue({
        value: User(currentCompany).getId(),
        label: User(currentCompany).getPublicData()?.companyName,
      });
      titleRef.current = User(currentCompany).getPublicData()?.companyName;
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
          {options.map(({ label, value, logo }) => {
            const handleMouseEnter = () => {
              setSelectedValue({ value, label });
            };
            const handleMouseClick = () => {
              titleRef.current = label;
              onDropdowClose();
            };
            const ensuredUser = {
              profileImage: logo,
              attributes: {
                profile: { abbreviatedName: getAbbreviatedName(label) },
              },
            };
            return (
              <div
                className={css.item}
                key={value}
                onMouseEnter={handleMouseEnter}
                onClick={handleMouseClick}>
                <Avatar
                  user={ensuredUser as TUser}
                  disableProfileLink
                  className={css.logo}
                />
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
