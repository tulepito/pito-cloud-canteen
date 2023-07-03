import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldMultipleSelect from '@components/FormFields/FieldMultipleSelect/FieldMultipleSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { RESTAURANT_STATUS_OPTIONS } from '@src/utils/enums';

import css from './ManagePartnerFilterForm.module.scss';

export type TManagePartnerFilterFormValues = {
  keywords?: string | string[];
  meta_status: string[];
};

type TExtraProps = {};
type TManagePartnerFilterFormComponentProps =
  FormRenderProps<TManagePartnerFilterFormValues> & Partial<TExtraProps>;
type TManagePartnerFilterFormProps = FormProps<TManagePartnerFilterFormValues> &
  TExtraProps;

const ManagePartnerFilterFormComponent: React.FC<
  TManagePartnerFilterFormComponentProps
> = (props) => {
  const { handleSubmit } = props;
  const intl = useIntl();
  const submitDisabled = false;

  return (
    <Form onSubmit={handleSubmit}>
      <FieldTextInput
        className={css.field}
        name="keywords"
        id="keywords"
        label="Tên đối tác"
        placeholder="Tìm kiếm"
      />
      <FieldMultipleSelect
        className={css.field}
        name="meta_status"
        id="meta_status"
        label="Trạng thái"
        placeholder="Chọn trạng thái"
        options={RESTAURANT_STATUS_OPTIONS}
      />
      <Button
        type="submit"
        className={css.filterBtn}
        size="medium"
        disabled={submitDisabled}>
        {intl.formatMessage({ id: 'ManagePartners.filterModal.title' })}
      </Button>
    </Form>
  );
};

const ManagePartnerFilterForm: React.FC<TManagePartnerFilterFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={ManagePartnerFilterFormComponent} />;
};

export default ManagePartnerFilterForm;
