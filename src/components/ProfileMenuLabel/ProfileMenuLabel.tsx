/**
 * MenuLabel is the only always visible part of Menu.
 * Clicking it toggles visibility of MenuContent.
 */
import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import type { MouseEvent, PropsWithChildren } from 'react';
import React from 'react';

import css from './ProfileMenuLabel.module.scss';

type TProfileMenuLabelProps = PropsWithChildren<{
  rootClassName?: string;
  className?: string;
  isOpenClassName?: string;
  isOpen?: boolean;
  onToggleActive?: () => void;
}>;

const ProfileMenuLabel: React.FC<TProfileMenuLabelProps> = (props) => {
  const { value: clickedWithMouse, setValue: setClickedWithMouse } =
    useBoolean(false);

  const {
    children,
    className,
    rootClassName,
    isOpen,
    isOpenClassName,
    onToggleActive,
  } = props;

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleActive) {
      onToggleActive();
    }
    // Don't show focus outline if user just clicked the element with mouse
    // tab + enter creates also a click event, but its location is origin.
    const { nativeEvent } = e;
    const isRealClick = !(
      nativeEvent.clientX === 0 && nativeEvent.clientY === 0
    );
    if (isRealClick) {
      setClickedWithMouse(true);
    }
  };

  const onBlur = () => {
    setClickedWithMouse(false);
  };

  const rootClass = rootClassName || css.root;
  const isOpenClass = isOpenClassName || css.isOpen;
  const classes = classNames(rootClass, className, {
    [css.clickedWithMouse]: clickedWithMouse,
    [isOpenClass]: isOpen,
  });

  return (
    <button className={classes} onClick={onClick} onBlur={onBlur}>
      {children}
    </button>
  );
};

export default ProfileMenuLabel;
