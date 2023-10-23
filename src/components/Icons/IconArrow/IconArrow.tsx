type IconArrowProps = {
  className?: string;
  direction?: 'up' | 'right' | 'down' | 'left' | 'double-down' | 'double-up';
  onClick?: () => void;
};
const IconArrow = (props: IconArrowProps) => {
  const { className, direction = 'up', onClick } = props;

  if (direction === 'up') {
    return (
      <svg
        onClick={onClick}
        preserveAspectRatio="none"
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3.75 12.5L10 6.25L16.25 12.5"
          stroke="#262626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (direction === 'right') {
    return (
      <svg
        onClick={onClick}
        preserveAspectRatio="none"
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.5 3.75L13.75 10L7.5 16.25"
          stroke="#262626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === 'down') {
    return (
      <svg
        onClick={onClick}
        preserveAspectRatio="none"
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.25 7.5L10 13.75L3.75 7.5"
          stroke="#262626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === 'double-down') {
    return (
      <svg
        onClick={onClick}
        preserveAspectRatio="none"
        className={className}
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.20711 5.29289C7.81658 4.90237 7.18342 4.90237 6.79289 5.29289C6.40237 5.68342 6.40237 6.31658 6.79289 6.70711L11.7929 11.7071C12.1834 12.0976 12.8166 12.0976 13.2071 11.7071L18.2071 6.70711C18.5976 6.31658 18.5976 5.68342 18.2071 5.29289C17.8166 4.90237 17.1834 4.90237 16.7929 5.29289L12.5 9.58579L8.20711 5.29289ZM8.20711 12.2929C7.81658 11.9024 7.18342 11.9024 6.79289 12.2929C6.40237 12.6834 6.40237 13.3166 6.79289 13.7071L11.7929 18.7071C12.1834 19.0976 12.8166 19.0976 13.2071 18.7071L18.2071 13.7071C18.5976 13.3166 18.5976 12.6834 18.2071 12.2929C17.8166 11.9024 17.1834 11.9024 16.7929 12.2929L12.5 16.5858L8.20711 12.2929Z"
          fill="#262626"
        />
      </svg>
    );
  }
  if (direction === 'double-up') {
    return (
      <svg
        onClick={onClick}
        preserveAspectRatio="none"
        className={className}
        width="25"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.70711 18.7071C7.31658 19.0976 6.68342 19.0976 6.29289 18.7071C5.90237 18.3166 5.90237 17.6834 6.29289 17.2929L11.2929 12.2929C11.6834 11.9024 12.3166 11.9024 12.7071 12.2929L17.7071 17.2929C18.0976 17.6834 18.0976 18.3166 17.7071 18.7071C17.3166 19.0976 16.6834 19.0976 16.2929 18.7071L12 14.4142L7.70711 18.7071ZM7.70711 11.7071C7.31658 12.0976 6.68342 12.0976 6.29289 11.7071C5.90237 11.3166 5.90237 10.6834 6.29289 10.2929L11.2929 5.29289C11.6834 4.90237 12.3166 4.90237 12.7071 5.29289L17.7071 10.2929C18.0976 10.6834 18.0976 11.3166 17.7071 11.7071C17.3166 12.0976 16.6834 12.0976 16.2929 11.7071L12 7.41421L7.70711 11.7071Z"
          fill="#262626"
        />
      </svg>
    );
  }

  return (
    <svg
      onClick={onClick}
      preserveAspectRatio="none"
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 16.25L6.25 10L12.5 3.75"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconArrow;
