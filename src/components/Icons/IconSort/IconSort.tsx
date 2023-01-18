import type { TIconProps } from '@utils/types';

const IconSort: React.FC<TIconProps> = (props) => {
  const { className, onClick } = props;

  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      className={className}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg">
      <path d="M4 0L7.4641 4.5H0.535898L4 0Z" fill="#BFBFBF" />
      <path d="M4 12L0.535898 7.5L7.4641 7.5L4 12Z" fill="#BFBFBF" />
    </svg>
  );
};

export default IconSort;
