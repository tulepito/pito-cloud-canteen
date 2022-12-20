import { useLayoutEffect } from 'react';

type TUseLockBodyScroll = {
  isOpen: boolean;
};

const useLockBodyScroll = ({ isOpen }: TUseLockBodyScroll) => {
  useLayoutEffect(() => {
    // Get original value of body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (isOpen) {
      // Prevent scrolling on mount
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);
};

export default useLockBodyScroll;
