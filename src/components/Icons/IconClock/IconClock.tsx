import type { TIconProps } from '@utils/types';
import classNames from 'classnames';

import css from './IconClock.module.scss';

type TIconClockProps = TIconProps;

const IconClock: React.FC<TIconClockProps> = (props) => {
  const { className, width = 24, height = 24, rootClassName } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg
      className={classes}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.5C7.313 3.5 3.5 7.313 3.5 12C3.5 16.687 7.313 20.5 12 20.5C16.687 20.5 20.5 16.687 20.5 12C20.5 7.313 16.687 3.5 12 3.5ZM12 22C6.486 22 2 17.514 2 12C2 6.486 6.486 2 12 2C17.514 2 22 6.486 22 12C22 17.514 17.514 22 12 22Z"
        fill="#262626"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.4311 15.6908C15.3001 15.6908 15.1681 15.6567 15.0471 15.5857L11.2771 13.3368C11.0511 13.2007 10.9111 12.9557 10.9111 12.6918V7.84375C10.9111 7.42975 11.2471 7.09375 11.6611 7.09375C12.0761 7.09375 12.4111 7.42975 12.4111 7.84375V12.2657L15.8161 14.2958C16.1711 14.5087 16.2881 14.9688 16.0761 15.3247C15.9351 15.5597 15.6861 15.6908 15.4311 15.6908Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconClock;
