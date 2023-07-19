import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './IconDocument.module.scss';

const IconDocument: React.FC<TIconProps> = (props) => {
  const { className } = props;
  const classes = classNames(css.root, className);

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      preserveAspectRatio="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M6.50833 1.6665H13.4925C16.0667 1.6665 17.5 3.14984 17.5 5.6915V14.2998C17.5 16.8832 16.0667 18.3332 13.4925 18.3332H6.50833C3.975 18.3332 2.5 16.8832 2.5 14.2998V5.6915C2.5 3.14984 3.975 1.6665 6.50833 1.6665ZM6.73333 5.54984V5.5415H9.22417C9.58333 5.5415 9.875 5.83317 9.875 6.19067C9.875 6.55817 9.58333 6.84984 9.22417 6.84984H6.73333C6.37417 6.84984 6.08333 6.55817 6.08333 6.19984C6.08333 5.8415 6.37417 5.54984 6.73333 5.54984ZM6.73333 10.6165H13.2667C13.625 10.6165 13.9167 10.3248 13.9167 9.9665C13.9167 9.60817 13.625 9.31567 13.2667 9.31567H6.73333C6.37417 9.31567 6.08333 9.60817 6.08333 9.9665C6.08333 10.3248 6.37417 10.6165 6.73333 10.6165ZM6.73333 14.4248H13.2667C13.5992 14.3915 13.85 14.1073 13.85 13.7748C13.85 13.4332 13.5992 13.1498 13.2667 13.1165H6.73333C6.48333 13.0915 6.24167 13.2082 6.10833 13.4248C5.975 13.6332 5.975 13.9082 6.10833 14.1248C6.24167 14.3332 6.48333 14.4582 6.73333 14.4248Z"
        fill="#262626"
      />
    </svg>
  );
};

export default IconDocument;
