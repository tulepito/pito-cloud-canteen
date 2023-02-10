import ValidationError from '@components/ValidationError/ValidationError';
import classNames from 'classnames';
import React from 'react';
import { Field } from 'react-final-form';

import css from './LocationAutocompleteInput.module.scss';
// eslint-disable-next-line import/extensions
import LocationAutocompleteInputImpl from './LocationAutocompleteInputImpl.tsx';

export const LocationAutocompleteInputComponent: React.FC<any> = (props) => {
  /* eslint-disable no-unused-vars */
  const { rootClassName, labelClassName, required, ...restProps } = props;
  const { input, label, meta, valueFromForm, ...otherProps } = restProps;
  /* eslint-enable no-unused-vars */

  const value =
    typeof valueFromForm !== 'undefined' ? valueFromForm : input.value;
  const locationAutocompleteProps = {
    label,
    meta,
    ...otherProps,
    input: { ...input, value },
  };

  const labelInfo = label ? (
    <label
      className={classNames(labelClassName, css.labelRoot)}
      htmlFor={input.name}>
      {label}
    </label>
  ) : null;

  const labelRequiredRedStar = required ? css.labelRequiredRedStar : '';

  return (
    <div className={rootClassName}>
      {labelInfo}
      {required && <span className={labelRequiredRedStar}>*</span>}
      <LocationAutocompleteInputImpl {...locationAutocompleteProps} />
      <ValidationError fieldMeta={meta} />
    </div>
  );
};

export default LocationAutocompleteInputImpl;

export const LocationAutocompleteInputField: React.FC<any> = (props) => {
  return <Field component={LocationAutocompleteInputComponent} {...props} />;
};
