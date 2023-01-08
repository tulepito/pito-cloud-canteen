import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { FormattedMessage, useIntl } from 'react-intl';

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
  onSearchRestaurant: (value: string) => void;
  onSelectRestaurant: () => void;
};
type TSearchRestaurantFormProps = FormProps<TSearchRestaurantFormValues> &
  TExtraProps;
type TSearchRestaurantFormComponentProps =
  FormRenderProps<TSearchRestaurantFormValues> & Partial<TExtraProps>;

const SearchRestaurantFormComponent: React.FC<
  TSearchRestaurantFormComponentProps
> = (props) => {
  const intl = useIntl();
  const {
    handleSubmit,
    onSelectRestaurant,
    selectRestaurantDisable,
    onSearchRestaurant,
  } = props;

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
        <Button
          type="button"
          disabled={selectRestaurantDisable}
          onClick={onSelectRestaurant}>
          <FormattedMessage id="SearchRestaurantForm.selectThisRestaurant" />
        </Button>
      </div>
    </Form>
  );
};

const SearchRestaurantForm: React.FC<TSearchRestaurantFormProps> = (props) => {
  return <FinalForm {...props} component={SearchRestaurantFormComponent} />;
};

export default SearchRestaurantForm;
