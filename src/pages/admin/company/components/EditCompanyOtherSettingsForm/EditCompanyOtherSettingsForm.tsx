import { useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';
import { composeValidators, numberMinLength } from '@src/utils/validators';

import { COMPANY_SETTING_OTHER_TAB_ID } from '../EditCompanyWizard/utils';

import css from './EditCompanyOtherSettingsForm.module.scss';

export type TEditCompanyOtherSettingsFormValues = {
  specificPCCFee?: any;
  tabValue?: string;
};

type TExtraProps = {
  formRef: any;
};
type TEditCompanyOtherSettingsFormComponentProps =
  FormRenderProps<TEditCompanyOtherSettingsFormValues> & Partial<TExtraProps>;
type TEditCompanyOtherSettingsFormProps =
  FormProps<TEditCompanyOtherSettingsFormValues> & TExtraProps;

const EditCompanyOtherSettingsFormComponent: React.FC<
  TEditCompanyOtherSettingsFormComponentProps
> = (props) => {
  const { handleSubmit, form, formRef } = props;
  useImperativeHandle(formRef, () => form);

  const intl = useIntl();

  const PCCFeeParseFn = (value: string, _name: string) => {
    return parseThousandNumber(value);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <>
        <FieldTextInput
          id="EditCompanyOtherSettingsForm.specificPCCFee"
          name="specificPCCFee"
          className={css.input}
          label={intl.formatMessage({
            id: 'EditCompanyOtherSettingsForm.PCCFeeField.label',
          })}
          placeholder={intl.formatMessage({
            id: 'EditCompanyOtherSettingsForm.PCCFeeField.placeholder',
          })}
          rightIcon={
            <div>
              {intl.formatMessage({
                id: 'EditCompanyOtherSettingsForm.PCCFeeField.unit',
              })}
            </div>
          }
          rightIconContainerClassName={css.inputSuffixed}
          validate={composeValidators(
            numberMinLength(
              intl.formatMessage({
                id: 'EditCompanyOtherSettingsForm.PCCFeeField.min',
              }),
              -1,
              true,
            ),
          )}
          parse={PCCFeeParseFn}
          format={PCCFeeParseFn}
        />
      </>
    </Form>
  );
};

const EditCompanyOtherSettingsForm: React.FC<
  TEditCompanyOtherSettingsFormProps
> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      initialValues={{
        ...props.initialValues,
        tabValue: COMPANY_SETTING_OTHER_TAB_ID,
      }}
      component={EditCompanyOtherSettingsFormComponent}
    />
  );
};

export default EditCompanyOtherSettingsForm;
