import { useLayoutEffect, useRef } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from './reduxHooks';

type TUseLockBodyScroll = {
  isOpen: boolean;
};

const useLockBodyScroll = ({ isOpen }: TUseLockBodyScroll) => {
  const openingModalIdList = useAppSelector(
    (state) => state.UI.openingModalIdList,
    shallowEqual,
  );
  const originalStyle = useRef<string>();
  useLayoutEffect(() => {
    originalStyle.current = window.getComputedStyle(document.body).overflow;
  }, []);
  useLayoutEffect(() => {
    // Get original value of body overflow
    if (openingModalIdList.length > 0) {
      document.body.style.overflow = 'hidden';
    }

    if (openingModalIdList.length === 0) {
      document.body.style.overflow = originalStyle.current!;
    }
  }, [openingModalIdList, isOpen]);
};

export default useLockBodyScroll;
