import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconCheckWithBackground.module.scss';

const IconCheckWithBackground: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg
      preserveAspectRatio="none"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <rect x="0" width="14" height="14" rx="7" fill="#73D13D" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.889 4.59052C11.0471 4.72491 11.0614 4.95903 10.9208 5.11065L6.9629 9.37906C6.82157 9.53147 6.57891 9.54116 6.42518 9.40056L4.13487 7.30561C3.99204 7.17495 3.97837 6.95725 4.10092 6.80842C4.23613 6.64419 4.48794 6.62159 4.64887 6.76222L6.42584 8.31523C6.58026 8.45019 6.81801 8.43812 6.95714 8.28827L10.3615 4.62078C10.4993 4.47236 10.7342 4.45891 10.889 4.59052Z"
        fill="#F0FFE0"
      />
    </svg>
  );
};

export default IconCheckWithBackground;
