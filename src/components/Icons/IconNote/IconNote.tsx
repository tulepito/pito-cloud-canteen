import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

type TIconNoteProps = TIconProps;

const IconNote: React.FC<TIconNoteProps> = (props) => {
  const { rootClassName, className, onClick } = props;
  const classes = classNames(rootClassName, className);

  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      className={classes}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.1602 10.4405L21.1802 14.6205C20.3402 18.2305 18.6802 19.6905 15.5602 19.3905C15.0602 19.3505 14.5202 19.2605 13.9402 19.1205L12.2602 18.7205C8.09018 17.7305 6.80018 15.6705 7.78018 11.4905L8.76018 7.3005C8.96018 6.4505 9.20018 5.7105 9.50018 5.1005C10.6702 2.6805 12.6602 2.0305 16.0002 2.8205L17.6702 3.2105C21.8602 4.1905 23.1402 6.2605 22.1602 10.4405Z"
        stroke="#2F54EB"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.1399 8.52961L17.9899 9.75961M12.1599 12.3996L15.0599 13.1396M15.5599 19.3896C14.9399 19.8096 14.1599 20.1596 13.2099 20.4696L11.6299 20.9896C7.65985 22.2696 5.56985 21.1996 4.27985 17.2296L2.99985 13.2796C1.71985 9.30961 2.77985 7.20961 6.74985 5.92961L8.32985 5.40961C8.73985 5.27961 9.12985 5.16961 9.49985 5.09961C9.19985 5.70961 8.95985 6.44961 8.75985 7.29961L7.77985 11.4896C6.79985 15.6696 8.08985 17.7296 12.2599 18.7196L13.9399 19.1196C14.5199 19.2596 15.0599 19.3496 15.5599 19.3896Z"
        stroke="#2F54EB"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconNote;
