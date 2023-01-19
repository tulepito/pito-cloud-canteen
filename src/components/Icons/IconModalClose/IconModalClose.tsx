import type { TIconProps } from '@utils/types';
import classNames from 'classnames';

import css from './IconModalClose.module.scss';

type IconModalCloseProps = TIconProps & {};
const IconModalClose: React.FC<IconModalCloseProps> = ({
  className,
  rootClassName,
  onClick,
}) => {
  return (
    <svg
      preserveAspectRatio="none"
      className={classNames(rootClassName, css.root, className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4263 11.9877L17.7193 16.2807C18.0983 16.6731 18.0928 17.2968 17.7071 17.6825C17.3214 18.0682 16.6977 18.0737 16.3053 17.6947L12.0123 13.4017L7.71931 17.6947C7.46824 17.9546 7.09643 18.0589 6.7468 17.9674C6.39718 17.8759 6.12413 17.6028 6.03262 17.2532C5.9411 16.9036 6.04536 16.5318 6.30531 16.2807L10.5983 11.9877L6.30531 7.69471C5.92634 7.30233 5.93176 6.67863 6.31749 6.29289C6.70323 5.90716 7.32693 5.90174 7.71931 6.28071L12.0123 10.5737L16.3053 6.28071C16.6977 5.90174 17.3214 5.90716 17.7071 6.29289C18.0928 6.67863 18.0983 7.30233 17.7193 7.69471L13.4263 11.9877Z"
        fill="black"
      />
    </svg>
  );
};

export default IconModalClose;
