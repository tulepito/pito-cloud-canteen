import React from 'react';
import classNames from 'classnames';

import css from './ErrorMessage.module.scss';

type TErrorMessageProps = {
  message: string;
  className?: string;
};

const ErrorMessage: React.FC<TErrorMessageProps> = (props) => {
  const { className, message } = props;
  const classes = classNames(css.root, className);

  return <p className={classes}>{message}</p>;
};

export default ErrorMessage;
