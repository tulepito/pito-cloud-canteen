import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import type { TDefaultProps } from '@utils/types';

import css from './SearchRestaurantForm.module.scss';

export type TSearchRestaurantFormValues = {
  name: string;
};

type TExtraProps = TDefaultProps & {
  formId?: string;
  errorMessage?: ReactNode;
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
            leftIcon={<IconSearch />}
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
