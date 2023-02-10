import Tooltip from '@components/Tooltip/Tooltip';
import classNames from 'classnames';
import React from 'react';
import { Field } from 'react-final-form';

import css from './FieldEntryTime.module.scss';

const FieldEntryTimeComponent = (props: any) => {
  const { input, meta: fieldMeta } = props;
  const { error } = fieldMeta;
  const hasError = error;
  const inputClasses = classNames(css.input, { [css.inputError]: error });

  return (
    <div className={css.inputContainer}>
      {hasError ? (
        <Tooltip
          tooltipContent={<div className={css.error}>{error}</div>}
          placement="topRight"
          overlayClassName={css.tooltip}>
          <input {...input} className={inputClasses} />
        </Tooltip>
      ) : (
        <input {...input} className={inputClasses} />
      )}
    </div>
  );
};

const FieldEntryTime = (props: any) => {
  return <Field {...props} type="time" component={FieldEntryTimeComponent} />;
};

export default FieldEntryTime;
