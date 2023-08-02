import React from 'react';
import type { FieldArrayProps } from 'react-final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import ValidationError from '@components/ValidationError/ValidationError';
import { User } from '@src/utils/data';
import type { TObject, TUser } from '@src/utils/types';

import css from './AddClientPaymentForm.module.scss';

type FieldMultipleSelectBookerComponentProps = {
  values?: TObject;
  label?: string;
  options: TObject[];
  disabled?: boolean;
} & FieldArrayProps<any, any>;

const FieldMultipleSelectBookerComponent: React.FC<
  FieldMultipleSelectBookerComponentProps
> = (props) => {
  const { meta, options, values = {}, disabled, fields } = props;
  const { name } = fields;

  return (
    <div className={css.fieldSelectBookerWrapper}>
      <div className={css.fieldSelect}>
        {options.map((booker) => {
          return (
            <div
              title={User(booker as TUser).getProfile().displayName}
              key={booker.id as any}
              className={classNames(css.bookerButton, {
                [css.active]: values[name]?.includes(booker.id),
                [css.disabled]: disabled,
              })}>
              <FieldCheckbox
                className={css.checkbox}
                id={`${name}.${booker.id}`}
                name={name}
                value={booker.id as string}
              />
              <div className={css.avatarWrapper}>
                <Avatar className={css.avatar} user={booker as TUser} />
              </div>
              <span className={css.label}>
                {User(booker as TUser).getProfile().displayName}
              </span>
              <label
                htmlFor={`${name}.${booker.id}`}
                key={booker.id as string}></label>
            </div>
          );
        })}
      </div>
      <ValidationError fieldMeta={meta} />
    </div>
  );
};

const FieldMultipleSelectBooker = (props: any) => {
  return (
    <FieldArray component={FieldMultipleSelectBookerComponent} {...props} />
  );
};

export default FieldMultipleSelectBooker;
