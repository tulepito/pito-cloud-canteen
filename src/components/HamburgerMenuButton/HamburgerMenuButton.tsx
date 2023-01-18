import { InlineTextButton } from '@components/Button/Button';
import classNames from 'classnames';
import React from 'react';

import css from './HamburgerMenuButton.module.scss';

type THamburgerMenuButtonProps = {
  className?: string;
  onClick?: () => void;
};

const HamburgerMenuButton: React.FC<THamburgerMenuButtonProps> = (props) => {
  return (
    <InlineTextButton
      onClick={props.onClick}
      className={classNames(css.hamburgerMenu, props.className)}>
      <div></div>
      <div></div>
      <div></div>
    </InlineTextButton>
  );
};

export default HamburgerMenuButton;
