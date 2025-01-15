import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

const IconLoading: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, className);

  return (
    <svg
      preserveAspectRatio="none"
      width="100"
      height="100"
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#EE392A"
      aria-label="audio-loading"
      className={classes}>
      <g fill="none" fillRule="evenodd" strokeWidth="2">
        <circle cx="22" cy="22" r="1">
          <animate
            attributeName="r"
            begin="0s"
            dur="1.8s"
            values="1; 20"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.165, 0.84, 0.44, 1"
            repeatCount="indefinite"></animate>
          <animate
            attributeName="strokeOpacity"
            begin="0s"
            dur="1.8s"
            values="1; 0"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.3, 0.61, 0.355, 1"
            repeatCount="indefinite"></animate>
        </circle>
        <circle cx="22" cy="22" r="1">
          <animate
            attributeName="r"
            begin="-0.9s"
            dur="1.8s"
            values="1; 20"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.165, 0.84, 0.44, 1"
            repeatCount="indefinite"></animate>
          <animate
            attributeName="strokeOpacity"
            begin="-0.9s"
            dur="1.8s"
            values="1; 0"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.3, 0.61, 0.355, 1"
            repeatCount="indefinite"></animate>
        </circle>
      </g>
    </svg>
  );
};

export default IconLoading;
