import { useRef } from 'react';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconDeadline from '@components/Icons/IconDeadline/IconDeadline';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import PopupModal from '@components/PopupModal/PopupModal';

import css from './OnboardingOrderModal.module.scss';

type TOnboardingOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const OnboardingOrderModal: React.FC<TOnboardingOrderModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const fakeFoodList = [
    {
      key: '0',
      label: 'Cơm rang bò',
    },
    {
      key: '1',
      label: 'Hủ tiếu',
    },
    {
      key: '2',
      label: 'Cơm tôm',
    },
    {
      key: '3',
      label: 'Phở bò',
    },
    {
      key: '4',
      label: 'Cơm gà cay',
    },
    {
      key: '5',
      label: 'Phở gà',
    },
    {
      key: '6',
      label: 'Miến lươn',
    },
  ];

  const instructionStep1Ref = useRef<HTMLDivElement>(null);

  return (
    <PopupModal
      id="OnboardingOrderModal"
      isOpen={isOpen}
      handleClose={onClose}
      closeClassName={css.slideModalClose}
      openClassName={css.slideModalOpen}
      scrollLayerClassName={css.slideModalScrollLayer}
      customHeader={
        <div className={css.modalHeader}>
          <div className={css.title}>Chi tiết đơn hàng</div>
          <IconClose className={css.closeIcon} onClick={onClose} />
        </div>
      }
      containerClassName={css.slideModalContainer}>
      <div className={css.modalContent}>
        <div className={css.sectionWrapper}>
          <div className={css.row}>
            <div className={css.daySession}>Bữa trưa</div>
            <div className={css.orderStatus}>
              <Badge
                className={css.badge}
                type={EBadgeType.warning}
                label="Chưa chọn món"
              />
            </div>
          </div>
          <div className={css.row}>
            <div className={css.orderTitle}>
              #PT1000 <span className={css.greyText}>| PITO Cloud Canteen</span>
            </div>
          </div>
          <div className={css.row}>
            <div className={css.orderHour}>09:00</div>
          </div>
        </div>
        <div className={css.horizontalLine}></div>
        <div className={css.sectionWrapper}>
          <div className={css.row}>
            <div className={css.orderDeadline}>
              <IconDeadline />
              <span>Còn 10:15:20 để chọn</span>
            </div>
          </div>
          <div className={css.row}>
            <div className={css.deliveryAddress}>
              <IconLocation />
              <span>123 Lê Văn Sỹ, F.01, quận Tân Bình, HCM </span>
            </div>
          </div>
          <div className={css.row}>
            <div className={css.restaurantName}>
              <IconShop />
              <span>Vua Hải Sản</span>
            </div>
          </div>
        </div>
        <div className={css.horizontalLine}></div>
        <div className={css.sectionWrapper}>
          <div className={css.row}>
            <div ref={instructionStep1Ref} className={css.pickingTitle}>
              Chọn món
            </div>
            <div className={css.viewDetail}>Xem chi tiết</div>
          </div>
          <div className={css.row}>
            <div className={css.fieldGroup}>
              {fakeFoodList.map(({ key, label }) => (
                <div key={key} className={css.checkboxItem}>
                  <input
                    className={css.radioInput}
                    id={`food-${key}`}
                    name="food"
                    type="radio"
                    value={key}
                  />
                  <label htmlFor={`food-${key}`}>{label}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={css.sectionWrapper}>
          <div className={css.row}>
            <Button className={css.btn} variant="secondary">
              Chọn giúp tôi
            </Button>
            <Button className={css.btn}>Xác nhận chọn món</Button>
          </div>
          <div className={css.row}>
            <Button className={css.btn} variant="inline">
              Không tham gia
            </Button>
          </div>
        </div>
      </div>
    </PopupModal>
  );
};

export default OnboardingOrderModal;
