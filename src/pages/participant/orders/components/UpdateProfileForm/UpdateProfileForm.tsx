import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { ALLERGIES_OPTIONS } from '@src/utils/enums';

import css from './UpdateProfileForm.module.scss';

export type TUpdateProfileFormValues = {
  name: string;
  phoneNumber: string;
  nutritions: string[];
  allergies: string[];
};

type TExtraProps = {
  nutritionOptions: { label: string; key: string }[];
  inProgress: boolean;
};
type TUpdateProfileFormComponentProps =
  FormRenderProps<TUpdateProfileFormValues> & Partial<TExtraProps>;
type TUpdateProfileFormProps = FormProps<TUpdateProfileFormValues> &
  TExtraProps;

const UpdateProfileFormComponent: React.FC<TUpdateProfileFormComponentProps> = (
  props,
) => {
  const { handleSubmit, nutritionOptions, inProgress } = props;

  return (
    <Form onSubmit={handleSubmit} className={css.container}>
      <div className={css.profileInforSection}>
        <div className={css.sectionTitle}>Thông tin cơ bản</div>
        <div className={css.fieldWrapper}>
          <FieldTextInput
            id="name"
            name="name"
            label="Tên"
            placeholder="Nhập tên"
          />
        </div>
        <div className={css.fieldWrapper}>
          <FieldTextInput
            id="phoneNumber"
            name="phoneNumber"
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
          />
        </div>
      </div>
      <div className={css.specialDemandSection}>
        <div className={css.sectionTitle}>Yêu cầu đặc biệt</div>
        <div className={css.fieldWrapper}>
          <div className={css.fieldTitle}>Dị ứng</div>
          <div className={css.fieldGroup}>
            {ALLERGIES_OPTIONS.map(({ label, key }) => (
              <FieldCheckbox
                key={key}
                id={`allergies-${key}`}
                name="allergies"
                value={key}
                label={label}
                className={css.field}
              />
            ))}
          </div>
        </div>
        <div className={css.fieldWrapper}>
          <div className={css.fieldTitle}>Chế độ dinh dưỡng</div>
          <div className={css.fieldGroup}>
            {nutritionOptions?.map(({ label, key }) => (
              <FieldCheckbox
                key={key}
                id={`nutritions-${key}`}
                name="nutritions"
                value={key}
                label={label}
                className={css.field}
              />
            ))}
          </div>
        </div>
      </div>
      <Button inProgress={inProgress} type="submit" className={css.submitBtn}>
        Tiếp theo
      </Button>
    </Form>
  );
};

const UpdateProfileForm: React.FC<TUpdateProfileFormProps> = (props) => {
  return <FinalForm {...props} component={UpdateProfileFormComponent} />;
};

export default UpdateProfileForm;
