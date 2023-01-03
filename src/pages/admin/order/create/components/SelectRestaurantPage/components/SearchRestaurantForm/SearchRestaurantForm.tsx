import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import SearchIcon from '@components/Icons/SearchIcon';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import css from './SearchRestaurantForm.module.scss';

export type TSearchRestaurantFormValues = {
  name: string;
};

type TExtraProps = {
  formId?: string;
  errorMessage?: ReactNode;
  rootClassName?: string;
  className?: string;
  inProgress?: boolean;
  selectRestaurantDisable: boolean;
  onSelectRestaurant: () => void;
};
type TSearchRestaurantFormProps = FormProps<TSearchRestaurantFormValues> &
  TExtraProps;
type TSearchRestaurantFormComponentProps =
  FormRenderProps<TSearchRestaurantFormValues> & Partial<TExtraProps>;

const SearchRestaurantFormComponent: React.FC<
  TSearchRestaurantFormComponentProps
> = (props) => {
  const { handleSubmit, onSelectRestaurant, selectRestaurantDisable } = props;

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.formContainer}>
        <div className={css.searchInputContainer}>
          <FieldTextInput
            name="name"
            leftIcon={<SearchIcon />}
            placeholder="Tìm tên nhà hàng"
          />
        </div>
        <Button
          type="button"
          disabled={selectRestaurantDisable}
          onClick={onSelectRestaurant}>
          {'Chọn nhà hàng này'}
        </Button>
      </div>
    </Form>
  );
};

const SearchRestaurantForm: React.FC<TSearchRestaurantFormProps> = (props) => {
  return <FinalForm {...props} component={SearchRestaurantFormComponent} />;
};

export default SearchRestaurantForm;
