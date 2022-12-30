import { IconCheckbox } from '@components/FieldCheckbox/FieldCheckbox';
import type { TFormEvent } from '@utils/types';
import classNames from 'classnames';
import { Field } from 'react-final-form';

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
  const { title: foodTitle, price: foodPrice = '150000' } = foodData;
  const classes = classNames(rootClassName || css.root, className);

  const handleOnChange = (input: any, event: TFormEvent): void => {
    const { onBlur, onChange } = input;
    if (customOnChange) {
      customOnChange(event);
    } else {
      onChange(event);
    }
    onBlur(event);
  };

  const successColorVariantMaybe = useSuccessColor
    ? {
        checkedClassName: css.checkedSuccess,
        boxClassName: css.boxSuccess,
      }
    : {};

  return (
    <div className={classes}>
      <Field type="checkbox" {...rest}>
        {(formRenderProps) => {
          const { input } = formRenderProps;
          return (
            <input
              id={id}
              className={css.input}
              {...input}
              onChange={(event: TFormEvent) => handleOnChange(input, event)}
            />
          );
        }}
      </Field>
      <div className={css.row}>
        <label htmlFor={id} className={css.label}>
          <span className={css.checkboxWrapper}>
            <IconCheckbox
              boxClassName={css.checkboxBox}
              className={svgClassName}
              {...successColorVariantMaybe}
            />
          </span>
        </label>

        <div className={css.labelContainer}>
          <div className={css.foodTitle}>{foodTitle}</div>
          <div>{foodPrice}đ</div>
        </div>
      </div>
    </div>
  );
};

export default FieldFoodSelectCheckbox;
