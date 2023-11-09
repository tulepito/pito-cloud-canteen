import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';

import css from './DeliveryDateTimeForm.module.scss';

export type TDeliveryDateTimeFormValues = {};

type TExtraProps = {};
type TDeliveryDateTimeFormComponentProps =
  FormRenderProps<TDeliveryDateTimeFormValues> & Partial<TExtraProps>;
type TDeliveryDateTimeFormProps = FormProps<TDeliveryDateTimeFormValues> &
  TExtraProps;

const DeliveryDateTimeFormComponent: React.FC<
  TDeliveryDateTimeFormComponentProps
> = (props) => {
  const { handleSubmit } = props;

  return (
    <Form className={css.formRoot} onSubmit={handleSubmit}>
      <div>
        <div>Thời hạn kết thúc chọn món</div>
        <div>
          <div></div>
          <div></div>
        </div>
        <Button variant="cta">Gửi lời mời qua email</Button>
      </div>
    </Form>
  );
};

const DeliveryDateTimeForm: React.FC<TDeliveryDateTimeFormProps> = (props) => {
  return <FinalForm {...props} component={DeliveryDateTimeFormComponent} />;
};

export default DeliveryDateTimeForm;
