import React from 'react';

import type { TIconProps } from '@src/utils/types';

const IconTickSquare: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;

  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      onClick={onClick}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.95797 3.5C5.42797 3.5 3.79297 5.233 3.79297 7.916V16.084C3.79297 18.767 5.42797 20.5 7.95797 20.5H16.626C19.157 20.5 20.793 18.767 20.793 16.084V7.916C20.793 5.233 19.157 3.5 16.627 3.5H7.95797ZM16.626 22H7.95797C4.56897 22 2.29297 19.622 2.29297 16.084V7.916C2.29297 4.378 4.56897 2 7.95797 2H16.627C20.016 2 22.293 4.378 22.293 7.916V16.084C22.293 19.622 20.016 22 16.626 22Z"
        fill="#65DB63"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1062 15.1247C10.9152 15.1247 10.7222 15.0517 10.5762 14.9047L8.20217 12.5317C7.90917 12.2387 7.90917 11.7647 8.20217 11.4717C8.49517 11.1787 8.96917 11.1787 9.26217 11.4717L11.1062 13.3137L15.3222 9.09866C15.6152 8.80566 16.0892 8.80566 16.3822 9.09866C16.6752 9.39166 16.6752 9.86566 16.3822 10.1587L11.6362 14.9047C11.4902 15.0517 11.2982 15.1247 11.1062 15.1247Z"
        fill="#65DB63"
      />
    </svg>
  );
};

export default IconTickSquare;
