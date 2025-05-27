import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import Tooltip from '@components/Tooltip/Tooltip';

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
  const intl = useIntl();
  const {
    handleFieldChange = console.info,
    shouldShowMainTitle = true,
    handleSubmit,
    disabled,
    subTitle = intl.formatMessage({
      id: 'cho-phep-pito-cloud-canteen-tu-chon-mon-cho-nhung-thanh-vien-khong-xac-nhan-dat-don',
    }),
    mainTitle = intl.formatMessage({ id: 'tu-dong-chon-mon-cho-thanh-vien' }),
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
        <Tooltip
          tooltipContent={
            <span>
              {intl.formatMessage({
                id: 'khi-het-thoi-han-he-thong-tu-dong-chon-mon-cho-nhung-thanh-vien-chua-chon',
              })}
            </span>
          }
          placement="bottom">
          <div>
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
        </Tooltip>
      </div>
    </Form>
  );
};

const AutomaticPickingForm: React.FC<TAutomaticPickingFormProps> = (props) => {
  return <FinalForm {...props} component={AutomaticPickingFormComponent} />;
};

export default AutomaticPickingForm;
