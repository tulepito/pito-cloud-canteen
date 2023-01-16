import { InlineTextButton } from '@components/Button/Button';
import classNames from 'classnames';
import React from 'react';

import css from './HamburgerMenuButton.module.scss';

type THamburgerMenuButton = {
  className?: string;
  onClick?: () => void;
};

const HamburgerMenuButton: React.FC<THamburgerMenuButton> = (props) => {
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
