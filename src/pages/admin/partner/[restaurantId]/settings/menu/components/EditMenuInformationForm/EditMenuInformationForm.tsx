import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDaysOfWeekCheckboxGroup from '@components/FormFields/FieldDaysOfWeekCheckboxGroup/FieldDaysOfWeekCheckboxGroup';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { EMenuTypes, MENU_MEAL_TYPE_OPTIONS, MENU_OPTIONS } from '@utils/enums';
import arrayMutators from 'final-form-arrays';
import { useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import type { TEditMenuInformationFormValues } from '../EditPartnerMenuWizard/utils';
import css from './EditMenuInformationForm.module.scss';

type TExtraProps = {
  formRef: any;
};
type TEditMenuInformationFormComponentProps =
  FormRenderProps<TEditMenuInformationFormValues> & Partial<TExtraProps>;
type TEditMenuInformationFormProps = FormProps<TEditMenuInformationFormValues> &
  TExtraProps;

const EditMenuInformationFormComponent: React.FC<
  TEditMenuInformationFormComponentProps
> = (props) => {
  const { handleSubmit, form, values, formRef } = props;
  const intl = useIntl();

  useImperativeHandle(formRef, () => form);

  const setStartDate = (date: Date) => {
    form.change('startDate', date);
  };
  return (
    <Form onSubmit={handleSubmit}>
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
          <FieldCheckboxGroup
            options={MENU_MEAL_TYPE_OPTIONS}
            name="mealTypes"
            id="mealTypes"
            label={intl.formatMessage({
              id: 'EditMenuInformationForm.mealTypeLabel',
            })}
            labelClassName={css.label}
          />
        </div>
      </div>
      <div className={css.wrapperFields}>
        <h2 className={css.title}>
          <FormattedMessage id="EditMenuInformationForm.applyTimeTitle" />
        </h2>
        <div>
          <div className={css.fields}>
            <FieldDatePicker
              id="startDate"
              name="startDate"
              selected={values.startDate}
              onChange={setStartDate}
              className={css.inputDate}
              dateFormat={'dd MMMM, yyyy'}
              placeholderText={'Nhập ngày bắt đầu'}
              autoComplete="off"
              label={intl.formatMessage({
                id: 'EditMenuInformationForm.startDateLabel',
              })}
            />
            {values.menuType === EMenuTypes.cycleMenu && (
              <FieldTextInput
                id="numberOfCycles"
                name="numberOfCycles"
                placeholder={intl.formatMessage({
                  id: 'EditMenuInformationForm.numberOfCyclesPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditMenuInformationForm.numberOfCyclesLabel',
                })}
                rightIcon={
                  <div className={css.weekSuffixed}>
                    {intl.formatMessage({
                      id: 'EditMenuInformationForm.week',
                    })}
                  </div>
                }
                rightIconContainerClassName={css.inputSuffixedContainer}
              />
            )}
          </div>
          <FieldDaysOfWeekCheckboxGroup
            label={intl.formatMessage({
              id: 'EditMenuInformationForm.daysOfWeekLabel',
            })}
            values={values}
            name="daysOfWeek"
          />
        </div>
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
