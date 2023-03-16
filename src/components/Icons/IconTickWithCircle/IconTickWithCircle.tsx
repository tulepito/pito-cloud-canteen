import React from 'react';

import type { TIconProps } from '@src/utils/types';

const IconTickWithCircle: React.FC<TIconProps> = (props) => {
  const { className } = props;

  return (
    <svg
      width={78}
      height={78}
      viewBox="0 0 78 78"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M70 39C70 56.1208 56.1208 70 39 70C21.8792 70 8 56.1208 8 39C8 21.8792 21.8792 8 39 8C56.1208 8 70 21.8792 70 39Z"
        fill="white"
        stroke="#262626"
        strokeWidth={3}
      />
      <path
        d="M34.2469 50.5942C33.5969 50.5942 32.9794 50.3342 32.5244 49.8792L23.3269 40.6817C22.3844 39.7392 22.3844 38.1792 23.3269 37.2367C24.2694 36.2942 25.8294 36.2942 26.7719 37.2367L34.2469 44.7117L50.9519 28.0067C51.8944 27.0642 53.4544 27.0642 54.3969 28.0067C55.3394 28.9492 55.3394 30.5092 54.3969 31.4517L35.9694 49.8792C35.5144 50.3342 34.8969 50.5942 34.2469 50.5942Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconTickWithCircle;
