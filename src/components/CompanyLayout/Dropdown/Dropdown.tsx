import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { User } from '@utils/data';

import css from './Dropdown.module.scss';

type TDropdownProps = {
  options: {
    value: string;
    label: string;
    logo?: any;
  }[];
  selectedValue: { value?: string; label?: string };
  setSelectedValue: (value: any) => void;
  customTitle?: (params: {
    title: string;
    onMouseEnter: () => void;
    isDropdownOpen: boolean;
    isMobile?: boolean;
  }) => ReactNode;
};
const Dropdown: React.FC<TDropdownProps> = (props) => {
  const { options, selectedValue, setSelectedValue, customTitle } = props;
  const router = useRouter();
  const { companyId } = router.query;
  const {
    value: isDropdownOpen,
    setTrue: onDropdownOpen,
    setFalse: onDropdowClose,
  } = useBoolean();
  const [title, setTitle] = useState(selectedValue.label);
  const companyList = useAppSelector(
    (state) => state.BookerCompanies.companies,
    shallowEqual,
  );
  const { isMobileLayout, isTabletLayout } = useViewport();

  useEffect(() => {
    if (companyId && companyId !== 'personal') {
      const currentCompany = companyList.find(
        (_company) => User(_company).getId() === companyId,
      );
      setSelectedValue({
        value: User(currentCompany!).getId(),
        label: User(currentCompany!).getPublicData().companyName,
      });
      setTitle(User(currentCompany!).getPublicData().companyName);
    }
  }, [companyId, companyList, setSelectedValue]);

  const isNotDesktop = isMobileLayout || isTabletLayout;

  const titleToUse = title || options[0]?.label;

  return (
    <OutsideClickHandler
      className={css.wrapper}
      onOutsideClick={onDropdowClose}>
      {customTitle ? (
        customTitle({
          title: titleToUse,
          onMouseEnter: onDropdownOpen,
          isDropdownOpen,
          isMobile: isNotDesktop,
        })
      ) : (
        <div className={css.selectedItem} onMouseEnter={onDropdownOpen}>
          {titleToUse}
        </div>
      )}

      {isDropdownOpen && (
        <div
          className={classNames(css.dropdown, {
            [css.isNotDesktop]: isNotDesktop,
          })}>
          {options.map(({ label, value }) => {
            const handleMouseEnter = () => {
              setSelectedValue({ value, label });
            };
            const handleMouseClick = () => {
              setTitle(label);
              onDropdowClose();
            };

            return (
              <div
                className={css.item}
                key={value}
                onMouseEnter={handleMouseEnter}
                onClick={handleMouseClick}>
                <div className={css.label} title={label}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OutsideClickHandler>
  );
};

export default Dropdown;
