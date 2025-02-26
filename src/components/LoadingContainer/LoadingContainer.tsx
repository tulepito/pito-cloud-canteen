import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import css from './LoadingContainer.module.scss';

type TLoadingContainerProps = {
  loadingText?: ReactNode;
  loadingTextClassName?: string;
  className?: string;
  iconClassName?: string;
};

const srcs = [
  '/static/loading-asset-1.png',
  '/static/loading-asset-2.png',
  '/static/loading-asset-3.png',
  '/static/loading-asset-4.png',
];

const useSrcByInterval = (imageSources: string[], interval: number) => {
  const [currentSrc, setCurrentSrc] = useState(
    imageSources[Math.floor(Math.random() * imageSources.length)],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * imageSources.length);

      setCurrentSrc(imageSources[nextIndex]);
    }, interval);

    return () => clearInterval(intervalId);
  }, [currentSrc, interval, imageSources]);

  return currentSrc;
};

const LoadingContainer: React.FC<TLoadingContainerProps> = (props) => {
  const { className } = props;
  const src = useSrcByInterval(srcs, 1000);

  return (
    <div
      className={classNames(
        css.root,
        className || 'max-w-32 max-h-32',
        'mx-auto',
      )}>
      <img src={src} alt="loading..." className="w-full h-full aspect-square" />
    </div>
  );
};

export const LoadingContainerImagePreloader = () => {
  useEffect(() => {
    srcs.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.setAttribute('crossOrigin', 'anonymous');
      img.setAttribute('decoding', 'async');
    });
  }, []);

  return null;
};

export default React.memo(LoadingContainer);
