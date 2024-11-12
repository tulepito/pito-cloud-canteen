import { useIntl } from 'react-intl';

import IconClock from '@components/Icons/IconClock/IconClock';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';

import DeliveryHourMobileModal from '../DeliveryHourMobileModal/DeliveryHourMobileModal';
import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';

import css from './DeliveryHourFieldMobile.module.scss';

type TDeliveryHourFieldMobileProps = {
  values: TMealDateFormValues;
  form: any;
};

const DeliveryHourFieldMobile: React.FC<TDeliveryHourFieldMobileProps> = ({
  values,
  form,
}) => {
  const intl = useIntl();
  const deliveryHourModalController = useBoolean();

  return (
    <div className={css.deliveryHourField}>
      <div className={css.label}>Chọn giờ giao hàng</div>

      <div
        className={css.fieldInput}
        onClick={deliveryHourModalController.setTrue}>
        <IconClock />
        <RenderWhen condition={!!values.deliveryHour}>
          <span>{values.deliveryHour}</span>
          <RenderWhen.False>
            <span className={css.placeholder}>
              {intl.formatMessage({
                id: 'OrderDeadlineField.deliveryHour.placeholder',
              })}
            </span>
          </RenderWhen.False>
        </RenderWhen>
      </div>

      <DeliveryHourMobileModal
        isOpen={deliveryHourModalController.value}
        onClose={deliveryHourModalController.setFalse}
        form={form}
      />
    </div>
  );
};

export default DeliveryHourFieldMobile;
