import Form from '@components/Form/Form';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

export type TNotificationSelectionFormValues = {};

type TExtraProps = {};
type TNotificationSelectionFormComponentProps =
  FormRenderProps<TNotificationSelectionFormValues> & Partial<TExtraProps>;
type TNotificationSelectionFormProps =
  FormProps<TNotificationSelectionFormValues> & TExtraProps;

const NOTIFICATION_OPTIONS = {
  ONE_DAY_AGO: 'aDayAgo',
  ONE_HOUR_AGO: 'aHourAgo',
  THIRTY_MIN_AGO: 'thirtyMinutesAgo',
};

const notificationOptions = [
  {
    label: 'NotificationSelectionForm.aDayAgo',
    id: NOTIFICATION_OPTIONS.ONE_DAY_AGO,
    name: 'notification',
    value: NOTIFICATION_OPTIONS.ONE_DAY_AGO,
    showAsRequired: true,
  },
  {
    label: 'NotificationSelectionForm.aHourAgo',
    id: NOTIFICATION_OPTIONS.ONE_HOUR_AGO,
    name: 'notification',
    value: NOTIFICATION_OPTIONS.ONE_HOUR_AGO,
  },
  {
    label: 'NotificationSelectionForm.thirtyMinutesAgo',
    id: NOTIFICATION_OPTIONS.THIRTY_MIN_AGO,
    name: 'notification',
    value: NOTIFICATION_OPTIONS.THIRTY_MIN_AGO,
  },
];

const NotificationSelectionFormComponent: React.FC<
  TNotificationSelectionFormComponentProps
> = (props) => {
  const intl = useIntl();
  const { handleSubmit } = props;

  return (
    <Form onSubmit={handleSubmit}>
      {notificationOptions.map((notiItem) => {
        const label = intl.formatMessage({ id: notiItem.label });
        notiItem = { ...notiItem, label };
        return <FieldRadioButton key={notiItem.id} {...notiItem} />;
      })}
    </Form>
  );
};

const NotificationSelectionForm: React.FC<TNotificationSelectionFormProps> = (
  props,
) => {
  return (
    <FinalForm {...props} component={NotificationSelectionFormComponent} />
  );
};

export default NotificationSelectionForm;
