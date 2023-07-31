import { useCallback, useEffect, useState } from 'react';

export const useBottomScroll = (callback: () => void) => {
  const [isBottom, setIsBottom] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;
    const scrollHeight =
      (document.documentElement && document.documentElement.scrollHeight) ||
      document.body.scrollHeight;
    const clientHeight =
      document.documentElement.clientHeight || window.innerHeight;
    const scrolledToBottom =
      Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    setIsBottom(scrolledToBottom);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isBottom) {
      callback();
      setIsBottom(false);
    }
  }, [isBottom, callback]);
};
