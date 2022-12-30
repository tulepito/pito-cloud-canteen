import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import EmptyIcon from '@components/Icons/EmptyIcon';
import SearchIcon from '@components/Icons/SearchIcon';
import arrayMutators from 'final-form-arrays';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import FieldFoodSelectCheckboxGroup from './components/FieldFoodSelect/FieldFoodSelectCheckboxGroup';
import FieldFoodSelectAll from './components/FieldFoodSelectAll/FieldFoodSelectAll';
import css from './SelectFoodForm.module.scss';

export type TSelectFoodFormValues = {
  food: string[];
};

type TExtraProps = {
  formId?: string;
  errorMessage?: ReactNode;
  rootClassName?: string;
  className?: string;
  inProgress?: boolean;
  items: any[];
};
type TSelectFoodFormProps = FormProps<TSelectFoodFormValues> & TExtraProps;
type TSelectFoodFormComponentProps = FormRenderProps<TSelectFoodFormValues> &
  Partial<TExtraProps>;

const SelectFoodFormComponent: React.FC<TSelectFoodFormComponentProps> = (
  props,
) => {
  const { handleSubmit, items = [], values } = props;
  const options = items.map((item) => {
    const { id, attributes } = item || {};
    const { title, price } = attributes;
    return { key: id?.uuid, value: id?.uuid, title, price };
  });
  console.log(values);

  return (
    <Form onSubmit={handleSubmit}>
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
              <FieldFoodSelectAll id="food.checkAll" name="checkAll" />
              <FieldFoodSelectCheckboxGroup
                id="food"
                name="food"
                options={options}
              />
            </div>{' '}
          </div>
          <div className={css.rightPart}>
            <EmptyIcon />
            <div className={css.actionContainer}>
              <Button fullWidth>{'Lưu kết quả'}</Button>
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
