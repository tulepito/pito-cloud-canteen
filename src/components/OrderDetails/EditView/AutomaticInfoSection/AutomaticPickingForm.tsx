import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';

import css from './AutomaticPickingForm.module.scss';

export type TAutomaticPickingFormValues = {
  autoPicking: boolean;
};

type TExtraProps = {
  handleFieldChange?: () => void;
  shouldShowMainTitle?: boolean;
  disabled?: boolean;
  subTitle?: string;
  mainTitle?: string;
};
type TAutomaticPickingFormComponentProps =
  FormRenderProps<TAutomaticPickingFormValues> & Partial<TExtraProps>;
type TAutomaticPickingFormProps = FormProps<TAutomaticPickingFormValues> &
  TExtraProps;

const AutomaticPickingFormComponent: React.FC<
  TAutomaticPickingFormComponentProps
> = (props) => {
  const {
    handleFieldChange = console.info,
    shouldShowMainTitle = true,
    handleSubmit,
    disabled,
    subTitle = 'Cho phép PITO Cloud Canteen tự chọn món cho những thành viên không xác nhận đặt đơn.',
    mainTitle = 'Tự động chọn món cho thành viên',
  } = props;

  const titleComponent = (
    <div className={css.titleContainer}>
      <RenderWhen condition={shouldShowMainTitle}>
        <div className={css.mainTitle}>{mainTitle}</div>
      </RenderWhen>
      <div>{subTitle}</div>
    </div>
  );

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.fieldContainer}>
        {titleComponent}
        <Field id="AutomaticPickingForm.toggle" name="autoPicking">
          {({ id, input }) => {
            return (
              <Toggle
                id={id}
                disabled={disabled}
                name={input.name}
                status={input.value ? 'on' : 'off'}
                onClick={(value) => {
                  handleFieldChange(value);
                }}
              />
            );
          }}
        </Field>
      </div>
    </Form>
  );
};

const AutomaticPickingForm: React.FC<TAutomaticPickingFormProps> = (props) => {
  return <FinalForm {...props} component={AutomaticPickingFormComponent} />;
};

export default AutomaticPickingForm;
