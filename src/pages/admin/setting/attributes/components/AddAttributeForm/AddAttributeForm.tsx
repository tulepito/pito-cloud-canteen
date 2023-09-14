import { useEffect, useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { renderListTimeOptions } from '@src/utils/dates';
import { EAttributeSetting } from '@src/utils/enums';
import { required } from '@src/utils/validators';

import css from './AddAttributeForm.module.scss';

const TIME_OPTIONS = renderListTimeOptions({});

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
  setSubmitError?: (error: string) => void;
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
  const {
    handleSubmit,
    values,
    inProgress,
    invalid,
    submitErrorText,
    setSubmitError,
  } = props;
  const intl = useIntl();

  useEffect(() => {
    if (!values?.[values?.attribute]) {
      setSubmitError?.('');
    }
  }, [setSubmitError, values, values?.attribute]);

  const inputValueLabel = intl.formatMessage({
    id: `AddAttributeForm.${values?.attribute}.label`,
  });

  const submitDisabled = invalid || inProgress;

  const parsedTimeOptions = useMemo(
    () =>
      TIME_OPTIONS.map((o) => ({
        key: o.key,
        label: o.label,
      })),
    [],
  );

  const startTimeValueIndex = parsedTimeOptions.findIndex(
    (option) => option.key === values?.start,
  );
  const endTimeOptions = parsedTimeOptions.slice(startTimeValueIndex + 1);

  const attributeOptions = useMemo(
    () =>
      ATTRIBUTE_LIST.map((attribute) => ({
        key: attribute.key,
        label: intl.formatMessage({
          id: attribute.label,
        }),
      })),
    [intl],
  );

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <FieldDropdownSelect
        options={attributeOptions}
        id="attribute"
        name="attribute"
        label={'Chọn mục'}
      />

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
          <FieldDropdownSelect
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
            )}
            placeholder={intl.formatMessage({
              id: 'AddAttributeForm.start.placeholder',
            })}
            options={parsedTimeOptions}
          />

          <FieldDropdownSelect
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
            )}
            placeholder={intl.formatMessage({
              id: 'AddAttributeForm.end.placeholder',
            })}
            options={endTimeOptions}
          />
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
