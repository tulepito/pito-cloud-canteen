import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './SendNotificationForm.module.scss';

export type TSendNotificationFormValues = {
  description: string;
};

type TExtraProps = {};
type TSendNotificationFormComponentProps =
  FormRenderProps<TSendNotificationFormValues> & Partial<TExtraProps>;
type TSendNotificationFormProps = FormProps<TSendNotificationFormValues> &
  TExtraProps;

const SendNotificationFormComponent: React.FC<
  TSendNotificationFormComponentProps
> = (props) => {
  const intl = useIntl();
  const { handleSubmit } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <FieldTextArea
        name="description"
        placeholder={intl.formatMessage({
          id: 'SendNotificationModal.descriptionPlaceholder',
        })}
      />
      <div className={css.actions}>
        <Button type="submit">
          {intl.formatMessage({ id: 'SendNotificationForm.submitButtonText' })}
        </Button>
      </div>
    </Form>
  );
};

const SendNotificationForm: React.FC<TSendNotificationFormProps> = (props) => {
  return <FinalForm {...props} component={SendNotificationFormComponent} />;
};

export default SendNotificationForm;
