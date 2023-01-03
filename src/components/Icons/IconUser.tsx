import type { TIconProps } from '@utils/types';

type TIconUserProps = TIconProps;

const IconUser: React.FC<TIconUserProps> = (props) => {
  const { className, width = 16, height = 16 } = props;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 10C10.2091 10 12 8.20914 12 6C12 3.79086 10.2091 2 8 2C5.79086 2 4 3.79086 4 6C4 8.20914 5.79086 10 8 10Z"
        stroke="#434343"
        strokeWidth="1.5"
        strokeMiterlimit={10}
      />
      <path
        d="M1.93677 13.4994C2.55149 12.4354 3.4354 11.5519 4.49969 10.9376C5.56399 10.3234 6.77119 9.99999 8.00003 10C9.22886 10 10.4361 10.3234 11.5003 10.9377C12.5646 11.552 13.4485 12.4355 14.0632 13.4995"
        stroke="#434343"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconUser;
