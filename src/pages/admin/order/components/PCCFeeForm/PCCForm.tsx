import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';

import css from './PCCForm.module.scss';

const UnitIcon = () => {
  return <div className={css.percentageIcon}>đ</div>;
};

const PCCFeeParseFn = (value: string, _name: string) => {
  return parseThousandNumber(value);
};

export type TPCCFormValues = { PCCFee: string };

type TExtraProps = { PCCFeePlaceholder: string; formSubmitRef: any };
type TPCCFormComponentProps = FormRenderProps<TPCCFormValues> &
  Partial<TExtraProps>;
type TPCCFormProps = FormProps<TPCCFormValues> & TExtraProps;

const PCCFormComponent: React.FC<TPCCFormComponentProps> = (props) => {
  const { handleSubmit, PCCFeePlaceholder, formSubmitRef } = props;
  formSubmitRef.current = handleSubmit;

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <FieldTextInput
        id={`PCCFee`}
        name={`PCCFee`}
        rightIcon={<UnitIcon />}
        placeholder={PCCFeePlaceholder}
        parse={PCCFeeParseFn}
        format={PCCFeeParseFn}
        type="text"
        className={css.input}
      />
    </Form>
  );
};

const PCCForm: React.FC<TPCCFormProps> = (props) => {
  return <FinalForm {...props} component={PCCFormComponent} />;
};

export default PCCForm;
