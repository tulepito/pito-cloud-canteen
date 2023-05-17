import { useEffect, useState } from 'react';

export const MAX_MOBILE_SCREEN_WIDTH = 768;
export const MAX_TABLET_SCREEN_WIDTH = 992;

export const useViewport = () => {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const handleWindowResize = () => {
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    if (window) {
      handleWindowResize();
      window.addEventListener('resize', handleWindowResize);
      window.addEventListener('orientationchange', handleWindowResize);
    }

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
    };
  }, []);

  const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;
  const isTabletLayout =
    viewport.width >= MAX_MOBILE_SCREEN_WIDTH &&
    viewport.width < MAX_TABLET_SCREEN_WIDTH;
  const isTabletLayoutOrLarger = viewport.width >= MAX_MOBILE_SCREEN_WIDTH;

  return { viewport, isMobileLayout, isTabletLayout, isTabletLayoutOrLarger };
};
