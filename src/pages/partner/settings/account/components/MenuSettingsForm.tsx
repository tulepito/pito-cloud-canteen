import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { MEAL_OPTIONS_WITH_TIME } from '@src/utils/options';

import css from './MenuSettingsForm.module.scss';

export type TMenuSettingsFormValues = {};

type TExtraProps = {
  isSubmitted?: boolean;
  setSubmitted?: (value: boolean) => void;
};
type TMenuSettingsFormComponentProps =
  FormRenderProps<TMenuSettingsFormValues> & Partial<TExtraProps>;
type TMenuSettingsFormProps = FormProps<TMenuSettingsFormValues> & TExtraProps;

const MenuSettingsFormComponent: React.FC<TMenuSettingsFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    pristine,
    isSubmitted = false,
    submitting,
    setSubmitted,
  } = props;

  const successAlertControl = useBoolean();

  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );
  const submitDisabled = pristine;

  useEffect(() => {
    if (isSubmitted) {
      successAlertControl.setTrue();
      if (setSubmitted) {
        setSubmitted(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);

  return (
    <Form onSubmit={handleSubmit} className={css.formRoot}>
      <>
        <div className={css.fieldContainer}>
          <div className={css.label}>Thực đơn bạn muốn phục vụ:</div>
          <FieldCheckboxGroup
            id="meals"
            name="meals"
            options={MEAL_OPTIONS_WITH_TIME}
          />
        </div>

        <div className={css.fieldContainer}>
          <div className={css.label}>Phong cách ẩm thực nhà hàng của bạn:</div>
          <FieldCheckboxGroup
            className={css.categoryCheckboxes}
            listClassName={css.categoryList}
            id="categories"
            name="categories"
            options={categoryOptions || []}
          />
        </div>

        <div className={css.actionContainer}>
          <Button disabled={submitDisabled} inProgress={submitting}>
            Lưu thay đổi
          </Button>
        </div>

        <Alert
          message="Cập nhật thông tin thành công"
          isOpen={successAlertControl.value}
          autoClose
          onClose={successAlertControl.setFalse}
          type={EAlertType.success}
          hasCloseButton={false}
          position={EAlertPosition.bottomLeft}
          messageClassName={css.alertMessage}
        />
      </>
    </Form>
  );
};

const MenuSettingsForm: React.FC<TMenuSettingsFormProps> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={MenuSettingsFormComponent}
    />
  );
};

export default MenuSettingsForm;
