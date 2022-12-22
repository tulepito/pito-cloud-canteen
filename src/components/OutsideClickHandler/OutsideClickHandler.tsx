import classNames from 'classnames';
import type { MutableRefObject, PropsWithChildren } from 'react';
import React, { useEffect, useRef } from 'react';

import css from './OutsideClickHandler.module.scss';

type TOutsideClickHandler = {
  rootClassName?: string;
  className?: string;
  onOutsideClick: () => void;
};

const OutsideClickHandler: React.FC<PropsWithChildren<TOutsideClickHandler>> = (
  props,
) => {
  const { rootClassName, className, children, onOutsideClick } = props;

  const nodeRef = useRef() as MutableRefObject<HTMLDivElement>;

  const handleClick = (event: any) => {
    if (nodeRef.current && !nodeRef.current.contains(event.target)) {
      onOutsideClick();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);
    return () => {
      document.removeEventListener('mousedown', handleClick, false);
    };
  }, []);

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes} ref={nodeRef}>
      {children}
    </div>
  );
};

export default OutsideClickHandler;
