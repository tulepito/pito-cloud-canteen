import Form from '@components/Form/Form';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { MENU_MEAL_TYPE_OPTIONS, MENU_OPTIONS } from '@utils/enums';
import { required } from '@utils/validators';
import type { FormApi, FormState } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import type { TEditMenuInformationFormValues } from '../EditPartnerMenuWizard/utils';
import FieldMenuApplyTimeGroup from '../FieldMenuApplyTimeGroup/FieldMenuApplyTimeGroup';
import css from './EditMenuInformationForm.module.scss';

type TExtraProps = {
  formRef: any;
  checkMenuUnconflictedHandle: (
    values: FormState<TEditMenuInformationFormValues>,
  ) => void;
};
type TEditMenuInformationFormComponentProps =
  FormRenderProps<TEditMenuInformationFormValues> & Partial<TExtraProps>;
type TEditMenuInformationFormProps = FormProps<TEditMenuInformationFormValues> &
  TExtraProps;

const EditMenuInformationFormComponent: React.FC<
  TEditMenuInformationFormComponentProps
> = (props) => {
  const { handleSubmit, form, values, formRef, checkMenuUnconflictedHandle } =
    props;
  const intl = useIntl();

  useImperativeHandle(formRef, () => form);

  return (
    <Form onSubmit={handleSubmit}>
      <FormSpy onChange={checkMenuUnconflictedHandle} />
      <div className={css.wrapperFields}>
        <h2 className={css.title}>
          <FormattedMessage id="EditMenuInformationForm.menuInformationTitle" />
        </h2>
        <div className={css.fields}>
          <FieldTextInput
            className={css.field}
            id="title"
            name="title"
            label={intl.formatMessage({
              id: 'EditMenuInformationForm.titleLabel',
            })}
            placeholder={intl.formatMessage({
              id: 'EditMenuInformationForm.titlePlaceholder',
            })}
            validate={required(
              intl.formatMessage({
                id: 'EditMenuInformationForm.titleRequired',
              }),
            )}
          />
          <div className={css.field}>
            <label className={css.inputLabel}>
              <FormattedMessage id="EditMenuInformationForm.menuTypeLabel" />
            </label>
            <div className={css.radioGroup}>
              {MENU_OPTIONS.map((opt) => (
                <FieldRadioButton
                  name="menuType"
                  id={opt.key}
                  key={opt.key}
                  value={opt.key}
                  label={opt.label}
                />
              ))}
            </div>
          </div>
          <div className={css.radioGroup}>
            <label className={css.inputLabel}>
              <FormattedMessage id="EditMenuInformationForm.mealTypeLabel" />
            </label>
            {MENU_MEAL_TYPE_OPTIONS.map((meal) => (
              <FieldRadioButton
                name="mealType"
                id={meal.key}
                key={meal.key}
                value={meal.key}
                label={meal.label}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={css.wrapperFields}>
        <h2 className={css.title}>
          <FormattedMessage id="EditMenuInformationForm.applyTimeTitle" />
        </h2>
        <FieldMenuApplyTimeGroup
          values={values}
          form={form as unknown as FormApi}
        />
      </div>
    </Form>
  );
};

const EditMenuInformationForm: React.FC<TEditMenuInformationFormProps> = (
  props,
) => {
  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      component={EditMenuInformationFormComponent}
    />
  );
};

export default EditMenuInformationForm;
