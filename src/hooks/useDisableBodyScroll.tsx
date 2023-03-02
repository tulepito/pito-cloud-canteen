import { useLayoutEffect } from 'react';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from './reduxHooks';

const useLockBodyScroll = () => {
  const openingModalIdList = useAppSelector(
    (state) => state.UI.openingModalIdList,
    shallowEqual,
  );
  useLayoutEffect(() => {
    if (openingModalIdList.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [openingModalIdList]);
};

export default useLockBodyScroll;
