import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import { useAppSelector } from '@hooks/reduxHooks';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';

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
  const { handleSubmit, submitting } = props;
  const isSendingRemindEmail = useAppSelector(
    (state) => state.OrderManagement.isSendingRemindEmail,
  );
  const anyActionInProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const submitDisabled =
    submitting || isSendingRemindEmail || anyActionInProgress;
  const inProgress = isSendingRemindEmail || submitting;

  return (
    <Form onSubmit={handleSubmit}>
      <FieldTextArea
        name="description"
        disabled={submitDisabled}
        placeholder={intl.formatMessage({
          id: 'SendNotificationModal.descriptionPlaceholder',
        })}
      />
      <div className={css.actions}>
        <Button
          type="submit"
          loadingMode="extend"
          inProgress={inProgress}
          disabled={submitDisabled}>
          {intl.formatMessage({
            id: 'SendNotificationForm.submitButtonText',
          })}
        </Button>
      </div>
    </Form>
  );
};

const SendNotificationForm: React.FC<TSendNotificationFormProps> = (props) => {
  return <FinalForm {...props} component={SendNotificationFormComponent} />;
};

export default SendNotificationForm;
