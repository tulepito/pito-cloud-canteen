import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';

type OutsideClickHandlerProps = {
  children: ReactNode;
  onOutsideClick: () => void;
};
const OutsideClickHandler: React.FC<OutsideClickHandlerProps> = ({
  children,
  onOutsideClick,
}) => {
  const nodeRef = useRef<any>(null);
  const handleClick = useCallback(
    (event: any) => {
      if (!nodeRef?.current?.contains(event.target)) {
        onOutsideClick();
      }
    },
    [onOutsideClick],
  );
  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);
    return () => {
      document.removeEventListener('mousedown', handleClick, false);
    };
  }, []);
  return <div ref={nodeRef}>{children}</div>;
};

export default OutsideClickHandler;
