import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import addDays from 'date-fns/addDays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { ORDER_ADMIN_FILTER_OPTIONS } from '@src/utils/enums';

import css from './FilterForm.module.scss';

export type TFilterFormValues = {
  meta_startDate?: number;
  meta_endDate?: number;
  meta_state?: string[];
  keywords?: string | string[];
  meta_orderState: string | string[];
};

type TExtraProps = {};
type TFilterFormComponentProps = FormRenderProps<TFilterFormValues> &
  Partial<TExtraProps>;
type TFilterFormProps = FormProps<TFilterFormValues> & TExtraProps;

const FilterFormComponent: React.FC<TFilterFormComponentProps> = (props) => {
  const intl = useIntl();
  const { handleSubmit, form, values } = props;
  const setStartDate = (date: number) => {
    form.change('meta_startDate', date);
    if (values.meta_endDate) {
      form.change('meta_endDate', undefined);
    }
  };
  const setEndDate = (date: number) => {
    form.change('meta_endDate', date);
  };
  const minEndDate = addDays(values.meta_startDate!, 1);

  return (
    <Form className={css.filterForm} onSubmit={handleSubmit}>
      <>
        <FieldTextInput
          name="keywords"
          id="keywords"
          label="Mã đơn/Tên công ty"
          labelClassName={css.label}
          placeholder="Nhập mã đơn hoặc tên công ty"
          className={css.input}
        />

        <label className={css.labelDate}>
          <FormattedMessage id="ManageOrderPage.createDateLabel" />
        </label>
        <div className={css.dateInputs}>
          <FieldDatePicker
            id="meta_startDate"
            name="meta_startDate"
            selected={values.meta_startDate}
            onChange={setStartDate}
            label="Ngày triển khai"
            className={css.dateInput}
            dateFormat={'dd MMMM, yyyy'}
            placeholderText={'Từ'}
            autoComplete="off"
          />
          <FieldDatePicker
            id="meta_endDate"
            name="meta_endDate"
            onChange={setEndDate}
            label="Ngày kết thúc"
            className={css.dateInput}
            selected={values.meta_endDate}
            dateFormat={'dd MMMM, yyyy'}
            placeholderText={'Đến'}
            autoComplete="off"
            minDate={minEndDate}
            disabled={!values.meta_startDate}
          />
        </div>
        <div className={css.orderStateSelect}>
          <FieldDropdownSelect
            id="meta_orderState"
            name="meta_orderState"
            label="Trạng thái đơn"
            labelClassName={css.label}
            placeholder="Chọn trạng thái đơn"
            options={ORDER_ADMIN_FILTER_OPTIONS}
            initialFieldValue={values.meta_orderState}
          />
        </div>
        <Button type="submit" className={css.filterBtn} size="medium">
          {intl.formatMessage({
            id: 'IntegrationFilterModal.filterMessage',
          })}
        </Button>
      </>
    </Form>
  );
};

const FilterForm: React.FC<TFilterFormProps> = (props) => {
  return <FinalForm {...props} component={FilterFormComponent} />;
};

export default FilterForm;
