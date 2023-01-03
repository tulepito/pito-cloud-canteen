import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import IconClose from '@components/IconClose/IconClose';
import EmptyIcon from '@components/Icons/EmptyIcon';
import SearchIcon from '@components/Icons/SearchIcon';
import arrayMutators from 'final-form-arrays';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';

import FieldFoodSelectCheckboxGroup from './components/FieldFoodSelect/FieldFoodSelectCheckboxGroup';
import FieldFoodSelectAll from './components/FieldFoodSelectAll/FieldFoodSelectAll';
import css from './SelectFoodForm.module.scss';

const DELAY_UPDATE_TIME = 300;

export type TSelectFoodFormValues = {
  food: string[];
  checkAll: boolean;
};

type TExtraProps = {
  formId?: string;
  errorMessage?: ReactNode;
  rootClassName?: string;
  className?: string;
  inProgress?: boolean;
  items: any[];
  handleFormChange: (food: string[] | undefined) => void;
};
type TSelectFoodFormProps = FormProps<TSelectFoodFormValues> & TExtraProps;
type TSelectFoodFormComponentProps = FormRenderProps<TSelectFoodFormValues> &
  Partial<TExtraProps>;

const SelectFoodFormComponent: React.FC<TSelectFoodFormComponentProps> = (
  props,
) => {
  const {
    formId,
    handleSubmit,
    items = [],
    values: { checkAll, food: foodIds = [] },
    form,
    handleFormChange,
  } = props;
  const submitDisable = foodIds?.length === 0;

  const options = items.map((item) => {
    const { id, attributes } = item || {};
    const { title, price } = attributes;

    return { key: id?.uuid, value: id?.uuid, title, price: price || 0 };
  });

  const removeFood = (foodId: string) => () => {
    const newFoodList = foodIds.filter((id) => id !== foodId);

    form.change('food', newFoodList);
  };

  const selectedFoodList = foodIds
    .map((foodId) => {
      return options.find((option) => foodId === option.key);
    })
    .filter((item) => item);

  const renderSelectedFoodList = () =>
    selectedFoodList.map((foodItem) => {
      const { key, title, price } = foodItem || {};

      return (
        <div key={key} className={css.selectFoodItem}>
          <div className={css.deleteIconBox} onClick={removeFood(key)}>
            <IconClose className={css.deleteIcon} />
          </div>
          <div className={css.titleContainer}>
            <div className={css.title}>{title}</div>
            <div>{price}đ</div>
          </div>
        </div>
      );
    });

  useEffect(() => {
    if (foodIds?.length === 0) {
      form.change('checkAll', false);
    }
  }, [foodIds?.length]);

  useEffect(() => {
    let timeoutFn: Function;

    if (checkAll) {
      timeoutFn = () =>
        form.change(
          'food',
          options.map((o) => o.key),
        );
    } else {
      timeoutFn = () => form.change('food', []);
    }

    setTimeout(() => timeoutFn(), DELAY_UPDATE_TIME);
  }, [checkAll]);

  return (
    <Form onSubmit={handleSubmit}>
      <OnChange name="food">{handleFormChange}</OnChange>
      <div className={css.formContainer}>
        <div className={css.searchInputContainer}>
          <FieldTextInput
            name="name"
            leftIcon={<SearchIcon />}
            placeholder="Tìm tên nhà hàng"
          />
        </div>
        <div className={css.contentContainer}>
          <div className={css.leftPart}>
            <div>
              <FieldFoodSelectAll
                id={`${formId}.food.checkAll`}
                name="checkAll"
              />
              <FieldFoodSelectCheckboxGroup
                id="food"
                name="food"
                options={options}
              />
            </div>
          </div>
          <div className={css.rightPart}>
            {foodIds?.length === 0 ? (
              <div className={css.emptyIconContainer}>
                <EmptyIcon />
              </div>
            ) : (
              <div>
                <div className={css.partTitle}>Món đã chọn</div>
                <div className={css.divider} />
                <div>{renderSelectedFoodList()}</div>
              </div>
            )}
            <div className={css.actionContainer}>
              <Button fullWidth disabled={submitDisable}>
                {'Lưu kết quả'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

const SelectFoodForm: React.FC<TSelectFoodFormProps> = (props) => {
  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      component={SelectFoodFormComponent}
    />
  );
};

export default SelectFoodForm;
