import { useState } from 'react';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import SlideModal from '@components/SlideModal/SlideModal';
import { generateTimeRangeItems } from '@src/utils/dates';

import css from './DeliveryHourMobileModal.module.scss';

const TIME_OPTIONS = generateTimeRangeItems({});

type TDeliveryHourMobileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  form: any;
};

const DeliveryHourMobileModal: React.FC<TDeliveryHourMobileModalProps> = (
  props,
) => {
  const { isOpen, onClose, form } = props;
  const [deliveryHour, setDeliveryHour] = useState<string>('');
  const parsedDeliveryHourOptions = TIME_OPTIONS.map((option) => ({
    label: option.label,
    key: option.key,
  }));

  const handleDeliveryHourSelect = (key: string) => () => {
    setDeliveryHour(key);
  };
  const handleSubmitDeliveryHour = () => {
    form.change('deliveryHour', deliveryHour);
    onClose();
  };

  return (
    <SlideModal
      id="DeliveryHourMobileModal"
      isOpen={isOpen}
      onClose={onClose}
      modalTitle="Chọn giờ giao hàng">
      <div className={css.timeOptionsWrapper}>
        {parsedDeliveryHourOptions.map(({ label, key }) => (
          <div
            className={classNames(css.timeOption, {
              [css.active]: deliveryHour === key,
            })}
            key={key}
            onClick={handleDeliveryHourSelect(key)}>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className={css.bottomBtns}>
        <Button className={css.btn} variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
        <Button
          type="button"
          className={css.btn}
          variant="primary"
          onClick={handleSubmitDeliveryHour}>
          Áp dụng
        </Button>
      </div>
    </SlideModal>
  );
};

export default DeliveryHourMobileModal;
