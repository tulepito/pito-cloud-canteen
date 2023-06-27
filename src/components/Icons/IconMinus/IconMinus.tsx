import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

const IconMinus: React.FC<TIconProps> = (props) => {
  const { className, rootClassName, onClick } = props;
  const classes = classNames(rootClassName, className);

  return (
    <svg
      onClick={onClick}
      preserveAspectRatio="none"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.48242 13H19.4824C20.0347 13 20.4824 12.5523 20.4824 12C20.4824 11.4477 20.0347 11 19.4824 11H5.48242C4.93014 11 4.48242 11.4477 4.48242 12C4.48242 12.5523 4.93014 13 5.48242 13Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconMinus;
