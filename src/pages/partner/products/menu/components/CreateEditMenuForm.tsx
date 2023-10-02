import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { MENU_MEAL_TYPE_OPTIONS } from '@src/utils/enums';

import css from './CreateEditMenuForm.module.scss';

const NEED_HANDLE_MENU_TYPES = MENU_MEAL_TYPE_OPTIONS.slice(0, 3);

export type TCreateEditMenuFormValues = {};

type TExtraProps = {};
type TCreateEditMenuFormComponentProps =
  FormRenderProps<TCreateEditMenuFormValues> & Partial<TExtraProps>;
type TCreateEditMenuFormProps = FormProps<TCreateEditMenuFormValues> &
  TExtraProps;

const CreateEditMenuFormComponent: React.FC<
  TCreateEditMenuFormComponentProps
> = (props) => {
  const { handleSubmit } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <div className={css.fieldsContainer}>
          <div className={css.containerTitle}>Thông tin menu</div>
          <div className={css.fieldContainer}>
            <FieldTextInput id="CreateEditMenuForm.menuName" name="menuName" />

            <FieldCheckboxGroup
              name="menuTypes"
              options={NEED_HANDLE_MENU_TYPES}
            />
            <div>
              {NEED_HANDLE_MENU_TYPES.map(({ key, label }) => (
                <FieldRadioButton
                  key={key}
                  name="mealType"
                  id={`CreateEditMenuForm.mealType.${key}`}
                  value={key}
                  label={label}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={css.fieldsContainer}>
          <div className={css.containerTitle}>Thời gian áp dụng</div>
        </div>
        <div className={css.fieldsContainer}>
          <div className={css.containerTitle}>Chọn món ăn</div>
        </div>
      </div>
    </Form>
  );
};

const CreateEditMenuForm: React.FC<TCreateEditMenuFormProps> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={CreateEditMenuFormComponent}
    />
  );
};

export default CreateEditMenuForm;
