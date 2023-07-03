import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldMultipleSelect from '@components/FormFields/FieldMultipleSelect/FieldMultipleSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';

import css from './FilterForm.module.scss';

export type TFilterFormValues = {
  keywords?: string | string[];
  pub_category: string[];
};

type TExtraProps = {
  categoryOptions: any;
};
type TFilterFormComponentProps = FormRenderProps<TFilterFormValues> &
  Partial<TExtraProps>;
type TFilterFormProps = FormProps<TFilterFormValues> & TExtraProps;

const FilterFormComponent: React.FC<TFilterFormComponentProps> = (props) => {
  const { handleSubmit, categoryOptions } = props;
  const intl = useIntl();
  const submitDisabled = false;

  return (
    <Form onSubmit={handleSubmit}>
      <FieldTextInput
        name="keywords"
        id="keywords"
        label="Tên món"
        placeholder="Nhập tên món"
        className={css.input}
      />
      <FieldMultipleSelect
        className={css.input}
        name="pub_category"
        id="pub_category"
        label="Phong cách ẩm thực"
        placeholder="Phong cách ẩm thực"
        options={categoryOptions}
      />
      <Button
        type="submit"
        className={css.filterBtn}
        size="medium"
        disabled={submitDisabled}>
        {intl.formatMessage({ id: 'ManagePartnerFoods.filterModal.title' })}
      </Button>
    </Form>
  );
};

const FilterForm: React.FC<TFilterFormProps> = (props) => {
  return <FinalForm {...props} component={FilterFormComponent} />;
};

export default FilterForm;
