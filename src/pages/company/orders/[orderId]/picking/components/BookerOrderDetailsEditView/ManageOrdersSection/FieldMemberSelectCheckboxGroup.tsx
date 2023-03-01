import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { useAppSelector } from '@hooks/reduxHooks';
import { User } from '@utils/data';
import type { TDefaultProps } from '@utils/types';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import type { FieldInputProps } from 'react-final-form';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import ParticipantCard from '../ManageParticipantsSection/ParticipantCard';
import css from './FieldMemberSelectCheckboxGroup.module.scss';

const FieldMemberSelectCheckbox = (props: any) => {
  const {
    id,
    useSuccessColor,
    customOnChange,
    data: {
      data: {
        memberData: { email, name },
      },
    },
    ...rest
  } = props;

  const participantData = useAppSelector(
    (state) => state.OrderManagement.participantData,
  );
  const participant = participantData.find(
    (p) => User(p).getAttributes().email === email,
  );

  const handleOnChange = (
    input: FieldInputProps<string, HTMLInputElement>,
    event: React.ChangeEvent | any,
  ): void => {
    const { onBlur, onChange } = input;
    if (customOnChange) {
      customOnChange(event);
    } else {
      onChange(event);
    }
    onBlur(event);
  };

  const boxClasses = classNames(css.box, {
    [css.boxSuccess]: useSuccessColor,
  });

  const checkClasses = classNames(css.checked, {
    [css.checkedSuccess]: useSuccessColor,
  });

  return (
    <div className={css.fieldRoot}>
      <Field type="checkbox" {...rest}>
        {(formRenderProps) => {
          const { input } = formRenderProps;

          return (
            <input
              id={id}
              className={css.input}
              {...input}
              onChange={(event: React.ChangeEvent | any) =>
                handleOnChange(input, event)
              }
            />
          );
        }}
      </Field>
      <label htmlFor={id} className={css.label}>
        <span className={css.checkboxWrapper}>
          <IconCheckbox
            className={css.checkbox}
            checkedClassName={checkClasses}
            boxClassName={boxClasses}
          />
        </span>
        <ParticipantCard
          hasDeleteIcon={false}
          email={email}
          name={name}
          participant={participant}
        />
      </label>
    </div>
  );
};

type TFieldMemberSelectCheckboxGroupRendererProps = TDefaultProps & {
  label?: string | ReactNode;
  id?: string;
  fields: any;
  options: any[];
  meta: any;
  name: string;
};

const FieldMemberSelectCheckboxGroupRenderer: React.FC<
  TFieldMemberSelectCheckboxGroupRendererProps
> = (props) => {
  const {
    className,
    rootClassName,
    fields: { name },
    options,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const listClasses = classNames(css.list);

  return (
    <fieldset className={classes}>
      <ul className={listClasses}>
        {options.map((option: any) => {
          const fieldId = `${option.key}`;

          return (
            <li key={fieldId} className={css.foodItem}>
              <FieldMemberSelectCheckbox
                id={fieldId}
                name={name}
                value={option.key}
                data={option}
              />
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
};

const FieldMemberSelectCheckboxGroup: React.FC<any> = (props) => (
  <FieldArray {...props} component={FieldMemberSelectCheckboxGroupRenderer} />
);

export default FieldMemberSelectCheckboxGroup;
