import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import SearchIcon from '@components/Icons/SearchIcon';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

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
  onSearchRestaurant: (value: string) => void;
};
type TSearchRestaurantFormProps = FormProps<TSearchRestaurantFormValues> &
  TExtraProps;
type TSearchRestaurantFormComponentProps =
  FormRenderProps<TSearchRestaurantFormValues> & Partial<TExtraProps>;

const SearchRestaurantFormComponent: React.FC<
  TSearchRestaurantFormComponentProps
> = (props) => {
  const intl = useIntl();
  const { handleSubmit, onSearchRestaurant } = props;

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.formContainer}>
        <div className={css.searchInputContainer}>
          <OnChange name="name">{onSearchRestaurant}</OnChange>
          <FieldTextInput
            name="name"
            leftIcon={<SearchIcon />}
            placeholder={intl.formatMessage({
              id: 'SearchRestaurantForm.findRestaurantByName',
            })}
          />
        </div>
      </div>
    </Form>
  );
};

const SearchRestaurantForm: React.FC<TSearchRestaurantFormProps> = (props) => {
  return <FinalForm {...props} component={SearchRestaurantFormComponent} />;
};

export default SearchRestaurantForm;
