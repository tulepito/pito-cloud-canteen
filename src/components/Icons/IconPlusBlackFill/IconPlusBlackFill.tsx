import type { TIconProps } from '@src/utils/types';

type IconOutlinePlusProps = TIconProps;
const IconPlusBlackFill: React.FC<IconOutlinePlusProps> = ({
  className,
  onClick,
}) => {
  return (
    <svg
      className={className}
      onClick={onClick}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 12H18"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6V18"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconPlusBlackFill;
