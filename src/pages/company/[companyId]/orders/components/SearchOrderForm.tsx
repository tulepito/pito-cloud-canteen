import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './SearchOrderForm.module.scss';

export type TSearchOrderFormValues = { keywords: string };

type TExtraProps = {};
type TSearchOrderFormComponentProps = FormRenderProps<TSearchOrderFormValues> &
  Partial<TExtraProps>;
type TSearchOrderFormProps = FormProps<TSearchOrderFormValues> & TExtraProps;

const SearchOrderFormComponent: React.FC<TSearchOrderFormComponentProps> = (
  props,
) => {
  const { handleSubmit } = props;
  const intl = useIntl();

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.fieldContainer}>
        <FieldTextInput
          className={css.fieldKeywords}
          name="keywords"
          leftIcon={<IconSearch />}
          placeholder={intl.formatMessage({
            id: 'SearchOrderForm.keywordsField.placeholder',
          })}
        />
      </div>
    </Form>
  );
};

const SearchOrderForm: React.FC<TSearchOrderFormProps> = (props) => {
  return <FinalForm {...props} component={SearchOrderFormComponent} />;
};

export default SearchOrderForm;
