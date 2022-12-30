import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import EmptyIcon from '@components/Icons/EmptyIcon';
import SearchIcon from '@components/Icons/SearchIcon';
import arrayMutators from 'final-form-arrays';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import FoodTable from './FoodTable';
import css from './SelectFoodForm.module.scss';

export type TSelectFoodFormValues = {};

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
  const { handleSubmit, items } = props;

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
            <FoodTable items={items || []} />
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
