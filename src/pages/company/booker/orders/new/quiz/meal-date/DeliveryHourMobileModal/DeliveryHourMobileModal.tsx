import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import SlideModal from '@components/SlideModal/SlideModal';

import css from './DeliveryHourMobileModal.module.scss';

// const TIME_OPTIONS = generateTimeRangeItems({});

type TDeliveryHourMobileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  hourOptions: Array<{ label: string; key: string }>;
};

const DeliveryHourMobileModal: React.FC<TDeliveryHourMobileModalProps> = (
  props,
) => {
  const { isOpen, onClose, form, hourOptions } = props;
  const [deliveryHour, setDeliveryHour] = useState<string>('');
  const intl = useIntl();

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
      modalTitle={intl.formatMessage({ id: 'chon-gio-giao-hang' })}>
      <div className={css.timeOptionsWrapper}>
        {hourOptions.map(({ label, key }) => (
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
          {intl.formatMessage({
            id: 'ManageParticipantsSection.deleteParticipantPopup.cancel',
          })}
        </Button>
        <Button
          type="button"
          className={css.btn}
          variant="primary"
          onClick={handleSubmitDeliveryHour}>
          {intl.formatMessage({
            id: 'MoveFoodToMenuForm.formStep.selectDays.submitText',
          })}
        </Button>
      </div>
    </SlideModal>
  );
};

export default DeliveryHourMobileModal;
