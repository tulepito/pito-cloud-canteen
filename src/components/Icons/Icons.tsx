type IconProps = {
  className?: string;
  onClick?: () => void;
};

export const DownloadInvoice: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      preserveAspectRatio="none"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3333 7.33333V3.33333L17.3333 3.33333C18.0697 3.33333 18.6667 3.93029 18.6667 4.66667V19.3333C18.6667 20.0697 18.0697 20.6667 17.3333 20.6667H6.66667C5.93029 20.6667 5.33333 20.0697 5.33333 19.3333V9.33333H9.33333C10.4379 9.33333 11.3333 8.4379 11.3333 7.33333ZM9.33333 8H6.276L10 4.276V7.33333C10 7.70152 9.70152 8 9.33333 8ZM17.3333 2H10.3907L4 8.39067V19.3333C4 20.8061 5.19391 22 6.66667 22H17.3333C18.8061 22 20 20.8061 20 19.3333V4.66667C20 3.19391 18.8061 2 17.3333 2ZM13.6531 18.6133L15.1985 16.9443C15.4119 16.7139 15.4119 16.358 15.1985 16.1276L15.1686 16.0976C14.9453 15.8909 14.5967 15.9043 14.39 16.1276L13.2989 17.3069L13.2984 10.5484C13.2984 10.2688 13.0944 10.0369 12.8272 9.99329L12.7359 9.98593C12.4253 9.98593 12.1734 10.2378 12.1734 10.5484L12.1739 17.3069L11.0752 16.1207L11.0519 16.0976C10.8287 15.8909 10.4801 15.9043 10.2733 16.1276C10.06 16.358 10.06 16.7139 10.2733 16.9443L11.8187 18.6133L11.8867 18.6813C12.3932 19.1503 13.1841 19.1199 13.6531 18.6133Z"
        fill="black"
      />
    </svg>
  );
};

export const Close: React.FC<IconProps> = ({ className, onClick }) => {
  return (
    <svg
      preserveAspectRatio="none"
      className={className}
      onClick={onClick}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4263 11.9877L17.7193 16.2807C18.0983 16.6731 18.0928 17.2968 17.7071 17.6825C17.3214 18.0682 16.6977 18.0737 16.3053 17.6947L12.0123 13.4017L7.71931 17.6947C7.46824 17.9546 7.09643 18.0589 6.7468 17.9674C6.39718 17.8759 6.12413 17.6028 6.03262 17.2532C5.9411 16.9036 6.04536 16.5318 6.30531 16.2807L10.5983 11.9877L6.30531 7.69471C5.92634 7.30233 5.93176 6.67863 6.31749 6.29289C6.70323 5.90716 7.32693 5.90174 7.71931 6.28071L12.0123 10.5737L16.3053 6.28071C16.6977 5.90174 17.3214 5.90716 17.7071 6.29289C18.0928 6.67863 18.0983 7.30233 17.7193 7.69471L13.4263 11.9877Z"
        fill="black"
      />
    </svg>
  );
};

export const Camera: React.FC<IconProps> = ({ className, onClick }) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.04 4.0515C16.05 4.4535 16.359 5.8535 16.772 6.3035C17.185 6.7535 17.776 6.9065 18.103 6.9065C19.841 6.9065 21.25 8.3155 21.25 10.0525V15.8475C21.25 18.1775 19.36 20.0675 17.03 20.0675H6.97C4.639 20.0675 2.75 18.1775 2.75 15.8475V10.0525C2.75 8.3155 4.159 6.9065 5.897 6.9065C6.223 6.9065 6.814 6.7535 7.228 6.3035C7.641 5.8535 7.949 4.4535 8.959 4.0515C9.97 3.6495 14.03 3.6495 15.04 4.0515Z"
        stroke="#130F26"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4955 9.5H17.5045"
        stroke="#130F26"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1783 13.1282C15.1783 11.3722 13.7553 9.94922 11.9993 9.94922C10.2433 9.94922 8.82031 11.3722 8.82031 13.1282C8.82031 14.8842 10.2433 16.3072 11.9993 16.3072C13.7553 16.3072 15.1783 14.8842 15.1783 13.1282Z"
        stroke="#130F26"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { DownloadInvoice, Close, Camera };
