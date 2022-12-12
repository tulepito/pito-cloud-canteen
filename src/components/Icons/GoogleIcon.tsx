type TGoogleIconProps = {
  className?: string;
};

const GoogleIcon: React.FC<TGoogleIconProps> = (props) => {
  const { className } = props;

  return (
    <svg
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}>
      <path
        fill="#ffffff"
        d="M16 7h-2V5h-1v2h-2v1h2v2h1V8h2zM5 9h2.829A3.006 3.006 0 0 1 5 11c-1.654 0-3-1.346-3-3s1.346-3 3-3c.717 0 1.407.257 1.943.724l1.314-1.508A4.955 4.955 0 0 0 5 3C2.243 3 0 5.243 0 8s2.243 5 5 5 5-2.243 5-5V7H5v2z"
        className="color000000 svgShape"
      />
    </svg>
  );
};

export default GoogleIcon;
