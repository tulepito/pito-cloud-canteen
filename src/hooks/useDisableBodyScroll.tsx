import { useEffect } from 'react';

import { useAppSelector } from './reduxHooks';

const useLockBodyScroll = () => {
  const openingModalIdList = useAppSelector(
    (state) => state.UI.openingModalIdList,
  );
  useEffect(() => {
    if (openingModalIdList.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [openingModalIdList]);
};

export default useLockBodyScroll;
