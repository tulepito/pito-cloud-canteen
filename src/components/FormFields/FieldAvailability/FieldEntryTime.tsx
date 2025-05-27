import React from 'react';
import DatePicker from 'react-datepicker';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';

import 'react-datepicker/dist/react-datepicker.css';
import css from './FieldEntryTime.module.scss';

const FieldEntryTimeComponent = (props: any) => {
  const {
    input,
    meta: fieldMeta,
    minTime,
    maxTime,
    timeIntervals = 5,
    excludeTimes,
  } = props;
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
          <DatePicker
            timeFormat="HH:mm"
            showTimeSelect
            showTimeSelectOnly
            minTime={minTime}
            maxTime={maxTime}
            timeIntervals={timeIntervals}
            startDate={new Date()}
            excludeTimes={excludeTimes}
            className={inputClasses}
            {...input}
          />
        </Tooltip>
      ) : (
        <DatePicker
          showTimeSelect
          timeFormat="HH:mm"
          showTimeSelectOnly
          startDate={new Date()}
          minTime={minTime}
          maxTime={maxTime}
          timeIntervals={timeIntervals}
          className={inputClasses}
          excludeTimes={excludeTimes}
          {...input}
        />
      )}
    </div>
  );
};

const FieldEntryTime = (props: any) => {
  return <Field {...props} type="time" component={FieldEntryTimeComponent} />;
};

export default FieldEntryTime;
