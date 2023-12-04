/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import type { FormApi } from 'final-form';

import Button from '@components/Button/Button';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInputWithBottomBox from '@components/FormFields/FieldTextInputWithBottomBox/FieldTextInputWithBottomBox';
import { useAppSelector } from '@hooks/reduxHooks';
import type { TEditPartnerFoodFormValues } from '@pages/admin/partner/[restaurantId]/settings/food/utils';
import {
  FOOD_SIDE_DISH_OPTIONS,
  FOOD_TYPE_OPTIONS,
  OTHER_OPTION,
} from '@src/utils/options';
import type { TKeyValue } from '@src/utils/types';
import { required } from '@src/utils/validators';

import css from './FoodDetailInfoTab.module.scss';

type TFoodDetailInforTabFormPartProps = {
  invalid?: boolean;
  inProgress?: boolean;
  form?: any;
  handleSubmit: (values: TEditPartnerFoodFormValues) => void;
  values: TEditPartnerFoodFormValues;
  onTabBack?: () => void;
};

const FoodDetailInforTabFormPart: React.FC<TFoodDetailInforTabFormPartProps> = (
  props,
) => {
  const { inProgress, invalid, form, handleSubmit, values, onTabBack } = props;
  const intl = useIntl();

  const {
    nutritions: nutritionsOptions = [],
    categories: categoriesOptions = [],
    packaging: packagingOptions = [],
  } = useAppSelector((state) => state.SystemAttributes, shallowEqual);

  const parsedPackagingOptions = useMemo(
    () =>
      packagingOptions
        .filter((cate: TKeyValue) => cate.key !== OTHER_OPTION)
        .map((cat: TKeyValue) => ({
          label: cat.label,
          key: cat.key,
        })),
    [JSON.stringify(packagingOptions)],
  );

  const parsedCategoryOptions = useMemo(
    () =>
      categoriesOptions
        .filter((cate: TKeyValue) => cate.key !== OTHER_OPTION)
        .map((cat: TKeyValue) => ({ key: cat.key, label: cat.label })),
    [JSON.stringify(categoriesOptions)],
  );

  const onSubmit = () => {
    handleSubmit(values);
  };

  return (
    <div className={css.root}>
      <div className={css.formTitle}>Chi tiết món ăn</div>
      <FieldDropdownSelect
        className={css.field}
        name="packaging"
        id="packaging"
        options={parsedPackagingOptions}
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.packagingLabel',
        })}
        labelClassName={css.label}
        required
        validate={required(
          intl.formatMessage({
            id: 'EditPartnerFoodForm.packagingRequired',
          }),
        )}
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.packagingPlaceholder',
        })}
      />
      <FieldCheckboxGroup
        className={css.field}
        options={nutritionsOptions || []}
        name="specialDiets"
        id="specialDiets"
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.specialDietsLabel',
        })}
        listClassName={css.specialDietsList}
        checkboxClassName={css.specialDietsCheckbox}
        labelClassName={css.label}
        itemClassName={css.specialDietsItem}
      />
      <div className={css.field}>
        <label className={css.label}>
          {intl.formatMessage({ id: 'EditPartnerFoodForm.foodTypeLabel' })}
          <span className={css.requiredStar}>*</span>
        </label>
        {FOOD_TYPE_OPTIONS.map((option) => (
          <FieldRadioButton
            key={option.key}
            name="foodType"
            id={option.key}
            value={option.key}
            label={option.label}
          />
        ))}
      </div>
      <FieldDropdownSelect
        className={css.field}
        name="category"
        options={parsedCategoryOptions}
        id="category"
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.foodCategoryLabel',
        })}
        labelClassName={css.label}
        required
        validate={required(
          intl.formatMessage({
            id: 'EditPartnerFoodForm.categoryRequired',
          }),
        )}
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.categoryPlaceholder',
        })}
      />
      <FieldTextInputWithBottomBox
        className={css.field}
        name="allergicIngredients"
        id="allergicIngredients"
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.allergicIngredientPlaceholder',
        })}
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.allergicIngredientLabel',
        })}
        labelClassName={css.label}
        form={form as unknown as FormApi}
      />
      <FieldCheckboxGroup
        className={css.field}
        listClassName={css.sideDishesList}
        name="sideDishes"
        id="sideDishes"
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.sideDishPlaceholder',
        })}
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.sideDishLabel',
        })}
        labelClassName={css.label}
        options={FOOD_SIDE_DISH_OPTIONS}
      />

      <div className={css.fixedBottomBtn}>
        <Button
          type="button"
          className={css.nextButton}
          disabled={invalid}
          onClick={onSubmit}
          inProgress={inProgress}>
          Tiếp theo
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={css.nextButton}
          onClick={onTabBack}>
          Trở về
        </Button>
      </div>
    </div>
  );
};

export default FoodDetailInforTabFormPart;
