import type { MutableRefObject, PropsWithChildren } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import type { TDefaultProps } from '@utils/types';

import css from './OutsideClickHandler.module.scss';

type TOutsideClickHandler = TDefaultProps & {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes} ref={nodeRef}>
      {children}
    </div>
  );
};

export default OutsideClickHandler;
