import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';

import css from './FilterColumnForm.module.scss';

export type TFilterColumnFormValues = {
  columnName: string[];
};

type TExtraProps = {};
type TFilterColumnFormComponentProps =
  FormRenderProps<TFilterColumnFormValues> & Partial<TExtraProps>;
type TFilterColumnFormProps = FormProps<TFilterColumnFormValues> & TExtraProps;

const COLUMN_OPTIONS = [
  {
    key: 'orderName',
    label: 'Tên đơn hàng',
  },
  {
    key: 'address',
    label: 'Địa điểm',
  },
  {
    key: 'bookerName',
    label: 'Khách hàng',
  },
  {
    key: 'startDate',
    label: 'Thời gian',
  },
  {
    key: 'restaurantName',
    label: 'Đối tác',
  },
  {
    key: 'staffName',
    label: 'Nhân viên phụ trách',
  },
  {
    key: 'isPaid',
    label: 'Thanh toán',
  },
];
const FilterColumnFormComponent: React.FC<TFilterColumnFormComponentProps> = (
  props,
) => {
  const { handleSubmit, values } = props;
  const { columnName } = values;
  const intl = useIntl();
  const submitDisabled = columnName.length === 0;

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      {COLUMN_OPTIONS.map((options) => (
        <FieldCheckbox
          key={options.key}
          id={options.key}
          name="columnName"
          value={options.key}
          label={options.label}
          className={css.fieldInput}
        />
      ))}
      <Button
        type="submit"
        className={css.filterBtn}
        size="medium"
        disabled={submitDisabled}>
        {intl.formatMessage({
          id: 'IntegrationFilterModal.filterMessage',
        })}
      </Button>
    </Form>
  );
};

const FilterColumnForm: React.FC<TFilterColumnFormProps> = (props) => {
  return <FinalForm {...props} component={FilterColumnFormComponent} />;
};

export default FilterColumnForm;
