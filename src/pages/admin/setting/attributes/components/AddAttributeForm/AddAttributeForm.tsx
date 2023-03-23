import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { generateTimeOptions } from '@src/utils/dates';
import { EAttributeSetting } from '@src/utils/enums';
import { required } from '@src/utils/validators';

import css from './AddAttributeForm.module.scss';

const TIME_OPTIONS = generateTimeOptions();

export type TAddAttributeFormValues = {
  attribute: EAttributeSetting;
  [EAttributeSetting.MEAL_STYLES]?: string;
  [EAttributeSetting.NUTRITIONS]?: string;
  [EAttributeSetting.DAY_SESSIONS]?: string;
  [EAttributeSetting.PACKAGING]?: string;
  start?: string;
  end?: string;
};

type TExtraProps = {
  inProgress: boolean;
  submitErrorText?: string;
};
type TAddAttributeFormComponentProps =
  FormRenderProps<TAddAttributeFormValues> & Partial<TExtraProps>;
type TAddAttributeFormProps = FormProps<TAddAttributeFormValues> & TExtraProps;

const ATTRIBUTE_LIST = [
  {
    key: EAttributeSetting.MEAL_STYLES,
    label: 'AdminAttributesSettingPage.attribute.mealStyles',
  },
  {
    key: EAttributeSetting.NUTRITIONS,
    label: 'AdminAttributesSettingPage.attribute.nutritions',
  },
  {
    key: EAttributeSetting.DAY_SESSIONS,
    label: 'AdminAttributesSettingPage.attribute.daySessions',
  },
  {
    key: EAttributeSetting.PACKAGING,
    label: 'AdminAttributesSettingPage.attribute.packaging',
  },
];

const AddAttributeFormComponent: React.FC<TAddAttributeFormComponentProps> = (
  props,
) => {
  const { handleSubmit, values, inProgress, invalid, submitErrorText } = props;
  const intl = useIntl();

  const inputValueLabel = intl.formatMessage({
    id: `AddAttributeForm.${values?.attribute}.label`,
  });

  const submitDisabled = invalid || inProgress;
  const startTimeValueIndex = TIME_OPTIONS.findIndex(
    (option) => option === values?.start,
  );
  const endTimeOptions = TIME_OPTIONS.slice(startTimeValueIndex + 1);

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <FieldSelect id="attribute" name="attribute" label={'Chọn mục'}>
        {ATTRIBUTE_LIST.map((attribute) => (
          <option key={attribute.key} value={attribute.key}>
            {intl.formatMessage({
              id: attribute.label,
            })}
          </option>
        ))}
      </FieldSelect>
      <FieldTextInput
        id={`${values?.attribute}`}
        name={`${values?.attribute}`}
        label={inputValueLabel}
        className={css.inputField}
        placeholder={'Nhập tên'}
        validate={required('Vui lòng nhập tên')}
      />

      {values.attribute === EAttributeSetting.DAY_SESSIONS && (
        <div className={css.timeFieldsWrapper}>
          <FieldSelect
            id="start"
            name="start"
            label={intl.formatMessage({
              id: 'AddAttributeForm.start.label',
            })}
            className={css.fieldSelect}
            validate={required(
              intl.formatMessage({
                id: 'AddAttributeForm.start.required',
              }),
            )}>
            <option value="" disabled>
              {intl.formatMessage({
                id: 'AddAttributeForm.start.placeholder',
              })}
            </option>
            {TIME_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FieldSelect>
          <FieldSelect
            id="end"
            name="end"
            label={intl.formatMessage({
              id: 'AddAttributeForm.end.label',
            })}
            className={css.fieldSelect}
            validate={required(
              intl.formatMessage({
                id: 'AddAttributeForm.end.required',
              }),
            )}>
            <option value="" disabled>
              {intl.formatMessage({
                id: 'AddAttributeForm.end.placeholder',
              })}
            </option>
            {endTimeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FieldSelect>
        </div>
      )}

      {submitErrorText && <div className={css.error}>{submitErrorText}</div>}

      <Button
        className={css.submitBtn}
        inProgress={inProgress}
        disabled={submitDisabled}>
        Thêm
      </Button>
    </Form>
  );
};

const AddAttributeForm: React.FC<TAddAttributeFormProps> = (props) => {
  return <FinalForm {...props} component={AddAttributeFormComponent} />;
};

export default AddAttributeForm;
