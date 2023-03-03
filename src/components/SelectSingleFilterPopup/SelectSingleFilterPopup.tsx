import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import useBoolean from '@hooks/useBoolean';
import type { TDefaultProps } from '@utils/types';

import css from './SelectSingleFilterPopup.module.scss';

type TSelectSingleFilterPopup = TDefaultProps & {
  label?: string;
  options: any[];
  queryParamNames?: string;
  initialValues?: any;
  contentPlacementOffset?: number;
  onSelect: (e: any) => void;
};

const optionLabel = (options: any[], key: any) => {
  const option = options.find((o) => o.key === key);
  return option ? option.label : key;
};

const getQueryParamName = (queryParamNames: any) => {
  return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
};

const SelectSingleFilterPopup: React.FC<TSelectSingleFilterPopup> = (props) => {
  const {
    rootClassName,
    className,
    label,
    options,
    queryParamNames = '',
    initialValues,
    contentPlacementOffset,
    onSelect,
  } = props;

  const { value: isOpen, setValue: setIsOpen } = useBoolean(false);

  const queryParamName = getQueryParamName(queryParamNames) as string;
  const initialValue =
    initialValues && initialValues[queryParamNames]
      ? initialValues[queryParamNames]
      : null;

  // resolve menu label text and class
  const menuLabel = initialValue ? optionLabel(options, initialValue) : label;
  const menuLabelClass = initialValue ? css.menuLabelSelected : css.menuLabel;

  const classes = classNames(rootClassName || css.root, className);

  const onToggleActive = (value: boolean) => {
    setIsOpen(value);
  };

  const selectOption = (paramsName: string, option: any) => () => {
    setIsOpen(false);
    onSelect({ [paramsName]: option });
  };

  return (
    <ProfileMenu
      className={classes}
      useArrow={false}
      onToggleActive={onToggleActive}
      contentPlacementOffset={contentPlacementOffset}
      isOpen={isOpen}>
      <ProfileMenuLabel className={menuLabelClass}>
        {menuLabel}
      </ProfileMenuLabel>
      <ProfileMenuContent className={css.menuContent}>
        {options.map((option) => {
          // check if this option is selected
          const selected = initialValue === option.key;
          // menu item border class
          const menuItemBorderClass = selected
            ? css.menuItemBorderSelected
            : css.menuItemBorder;

          return (
            <ProfileMenuItem key={option.key}>
              <button
                className={css.menuItem}
                onClick={selectOption(queryParamName, option.key)}>
                <span className={menuItemBorderClass} />
                {option.label}
              </button>
            </ProfileMenuItem>
          );
        })}
        <ProfileMenuItem key={'clearLink'}>
          <button
            className={css.clearMenuItem}
            onClick={selectOption(queryParamName, null)}>
            <FormattedMessage id={'SelectSingleFilter.popupClear'} />
          </button>
        </ProfileMenuItem>
      </ProfileMenuContent>
    </ProfileMenu>
  );
};

export default SelectSingleFilterPopup;
