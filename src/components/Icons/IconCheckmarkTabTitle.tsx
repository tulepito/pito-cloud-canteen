import { TIconProps } from '@utils/types';

const IconCheckmarkTabTitle: React.FC<TIconProps> = (props) => {
  const { className, width = 14, height = 10 } = props;
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.3575 0.309716C12.945 -0.103369 12.2751 -0.103108 11.862 0.309716L5.13114 7.04082L2.13957 4.04928C1.72649 3.63619 1.05688 3.63619 0.643798 4.04928C0.230713 4.46236 0.230713 5.13197 0.643798 5.54505L4.3831 9.28435C4.58951 9.49077 4.86017 9.59423 5.13086 9.59423C5.40154 9.59423 5.67246 9.49103 5.87887 9.28435L13.3575 1.80546C13.7706 1.39266 13.7706 0.722775 13.3575 0.309716Z"
        fill="#027A48"
      />
    </svg>
  );
};

export default IconCheckmarkTabTitle;
