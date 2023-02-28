import { useLayoutEffect, useRef } from 'react';

type TUseLockBodyScroll = {
  isOpen: boolean;
};

const useLockBodyScroll = ({ isOpen }: TUseLockBodyScroll) => {
  const originalStyle = useRef<string>();

  useLayoutEffect(() => {
    originalStyle.current = window.getComputedStyle(document.body).overflow;
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      // Prevent scrolling on mount
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
};

export default useLockBodyScroll;
