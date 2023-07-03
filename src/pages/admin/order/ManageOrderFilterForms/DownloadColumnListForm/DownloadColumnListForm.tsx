import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './DownloadColumnListForm.module.scss';

export type TDownloadColumnListFormValues = {
  downloadColumnListName: string[];
};

type TExtraProps = {};
type TDownloadColumnListFormComponentProps =
  FormRenderProps<TDownloadColumnListFormValues> & Partial<TExtraProps>;
type TDownloadColumnListFormProps = FormProps<TDownloadColumnListFormValues> &
  TExtraProps;

const DOWNLOAD_COLUMN_LIST_OPTIONS = [
  {
    key: 'title',
    label: 'Mã đơn hàng',
  },
  {
    key: 'startDate',
    label: 'Ngày tạo đơn',
  },
  {
    key: 'companyName',
    label: 'Tên công ty',
  },
  {
    key: 'bookerPhoneNumber',
    label: 'SĐT người đại diện',
  },
  {
    key: 'address',
    label: 'Địa chỉ công ty',
  },
  {
    key: 'deliveryDate',
    label: 'Ngày giao hàng',
  },
  {
    key: 'totalDishes',
    label: 'Số phần ăn',
  },
  {
    key: 'note',
    label: 'Ghi chú đơn hàng',
  },
  {
    key: 'partnerName',
    label: 'Đối tác',
  },
  {
    key: 'partnerPhoneNumber',
    label: 'SĐT đối tác',
  },
  {
    key: 'partnerAddress',
    label: 'Địa chỉ đối tác',
  },
];

const ORDER_TYPE_OPTIONS = [
  {
    key: 'group',
    label: 'Đơn nhóm',
  },
  {
    key: 'normal',
    label: 'Đơn lẻ',
  },
];

const DownloadColumnListFormComponent: React.FC<
  TDownloadColumnListFormComponentProps
> = (props) => {
  const { handleSubmit, values } = props;
  const { downloadColumnListName } = values;
  const isOrderTitleSelected = downloadColumnListName?.includes('title');
  const submitDisabled = !downloadColumnListName?.length;

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <div className={css.formTitle}>Tải danh sách</div>
      <div className={css.formDesc}>Chọn thông tin để tải xuống danh sách</div>
      {DOWNLOAD_COLUMN_LIST_OPTIONS.map((options) => {
        return (
          <>
            <FieldCheckbox
              key={options.key}
              id={`downloadColumnList-${options.key}`}
              name="downloadColumnListName"
              value={options.key}
              label={options.label}
              className={css.fieldInput}
            />
            <RenderWhen
              condition={isOrderTitleSelected && options.key === 'title'}>
              {ORDER_TYPE_OPTIONS.map((orderOption) => (
                <FieldCheckbox
                  key={orderOption.key}
                  id={`downloadColumnList-${orderOption.key}`}
                  name="downloadColumnListName"
                  value={orderOption.key}
                  label={orderOption.label}
                  className={classNames(css.fieldInput, css.childFieldInput)}
                />
              ))}
            </RenderWhen>
          </>
        );
      })}
      <Button
        type="submit"
        className={css.filterBtn}
        size="medium"
        disabled={submitDisabled}>
        Tải danh sách
      </Button>
    </Form>
  );
};

const DownloadColumnListForm: React.FC<TDownloadColumnListFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={DownloadColumnListFormComponent} />;
};

export default DownloadColumnListForm;
