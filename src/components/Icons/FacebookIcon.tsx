type TFacebookIconProps = {
  className?: string;
};

const FacebookIcon: React.FC<TFacebookIconProps> = (props) => {
  const { className } = props;

  return (
    <svg
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="32px"
      height="32px"
      viewBox="0 0 32 32"
      version="1.1"
      className={className}>
      f
    </svg>
  );
};

export default FacebookIcon;
