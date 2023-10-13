import type { ReactNode } from 'react';
import React from 'react';
import type { FieldInputProps } from 'react-final-form';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import classNames from 'classnames';

import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconFoodListEmpty from '@components/Icons/IconFoodListEmpty/IconFoodListEmpty';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import type { TDefaultProps } from '@utils/types';

import FoodCard from './FoodCard';

import css from './FieldFoodSelectCheckboxGroup.module.scss';

const FieldFoodSelectCheckbox = (props: any) => {
  const { id, useSuccessColor, customOnChange, data = {}, ...rest } = props;

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

        <FoodCard data={data?.data} />
      </label>
    </div>
  );
};

type TFieldFoodSelectCheckboxGroupRendererProps = TDefaultProps & {
  label?: string | ReactNode;
  id?: string;
  fields: any;
  options: any[];
  meta: any;
  name: string;
  disabled: boolean;
  emptyFoodLabel?: string;
};

const FieldFoodSelectCheckboxGroupRenderer: React.FC<
  TFieldFoodSelectCheckboxGroupRendererProps
> = (props) => {
  const {
    className,
    rootClassName,
    fields,
    options = [],
    emptyFoodLabel,
  } = props;
  const queryFoodsInProgress = useAppSelector(
    (state) => state.foods.queryFoodsInProgress,
  );

  const classes = classNames(rootClassName || css.root, className);
  const listClasses = classNames(css.list);

  return (
    <fieldset className={classes}>
      {options.length > 0 && (
        <ul className={listClasses}>
          {options.map((option: any) => {
            const fieldId = `FieldFoodSelectCheckboxGroup.${option.key}`;

            return (
              <li key={fieldId} className={css.foodItem}>
                <FieldFoodSelectCheckbox
                  id={fieldId}
                  name={fields.name}
                  value={option.key}
                  data={option}
                />
              </li>
            );
          })}
        </ul>
      )}

      <RenderWhen condition={queryFoodsInProgress}>
        <LoadingContainer className={css.loading} />
        <RenderWhen.False>
          <RenderWhen condition={options.length === 0}>
            <div className={css.emptyFoodListContainer}>
              <IconFoodListEmpty />
              <div>{emptyFoodLabel}</div>
            </div>
          </RenderWhen>
        </RenderWhen.False>
      </RenderWhen>
    </fieldset>
  );
};

const FieldFoodSelectCheckboxGroup: React.FC<any> = (props) => (
  <FieldArray {...props} component={FieldFoodSelectCheckboxGroupRenderer} />
);

export default FieldFoodSelectCheckboxGroup;
