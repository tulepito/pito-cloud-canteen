import classNames from 'classnames';
import type { FC } from 'react';
import React from 'react';

import css from './ValidationError.module.scss';

interface ValidationErrorProps {
  rootClassName?: string;
  className?: string;
  fieldMeta: any;
}

/**
 * This component can be used to show validation errors next to form
 * input fields. The component takes the final-form Field component
 * `meta` object as a prop and infers if an error message should be
 * shown.
 */
const ValidationError: FC<ValidationErrorProps> = (props) => {
  const { rootClassName, className, fieldMeta } = props;
  const { touched, error } = fieldMeta;
  const classes = classNames(rootClassName || css.root, className);
  return touched && error ? <div className={classes}>{error}</div> : null;
};

export default ValidationError;
