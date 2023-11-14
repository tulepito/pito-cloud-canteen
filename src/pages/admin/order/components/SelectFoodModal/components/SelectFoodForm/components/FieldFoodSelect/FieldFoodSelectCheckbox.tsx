import type { FieldInputProps } from 'react-final-form';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { addCommas } from '@helpers/format';

import css from './FieldFoodSelectCheckbox.module.scss';

const FieldFoodSelectCheckbox = (props: any) => {
  const {
    rootClassName,
    className,
    svgClassName,
    id,
    useSuccessColor,
    customOnChange,
    foodData,
    ...rest
  } = props;
  const { title: foodTitle, price: foodPrice } = foodData;
  const classes = classNames(rootClassName || css.root, className);

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
    <div className={classes}>
      <div className={css.row}>
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
              className={svgClassName}
              checkedClassName={checkClasses}
              boxClassName={boxClasses}
            />
          </span>
        </label>

        <div className={css.labelContainer}>
          <div className={css.foodTitle}>{foodTitle}</div>
          <div>{addCommas(foodPrice.amount)}đ</div>
        </div>
      </div>
    </div>
  );
};

export default FieldFoodSelectCheckbox;
