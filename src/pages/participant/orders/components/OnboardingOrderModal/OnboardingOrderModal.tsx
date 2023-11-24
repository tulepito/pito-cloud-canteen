/* eslint-disable no-unsafe-optional-chaining */
import { useRef } from 'react';
import classNames from 'classnames';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconDeadline from '@components/Icons/IconDeadline/IconDeadline';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import PopupModal from '@components/PopupModal/PopupModal';
import { RedDotPortal } from '@components/RedDotPortal/RedDotPortal';
import { useAppSelector } from '@hooks/reduxHooks';

import css from './OnboardingOrderModal.module.scss';

type TOnboardingOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isDuringTour?: boolean;
};
const OnboardingOrderModal: React.FC<TOnboardingOrderModalProps> = (props) => {
  const { isOpen, onClose, isDuringTour } = props;
  const walkthroughCurrentStep = useAppSelector(
    (state) => state.ParticipantOrderList.walkthroughCurrentStep,
  );

  const step1Ref = useRef<any>(null);
  const step2Ref = useRef<any>(null);
  const step3Ref = useRef<any>(null);

  const step1Position = step1Ref?.current?.getBoundingClientRect();
  const step2Position = step2Ref?.current?.getBoundingClientRect();
  const step3Position = step3Ref?.current?.getBoundingClientRect();

  const step1TopPosition = step1Position?.y + 8;
  const step1LeftPosition = step1Position?.width + step1Position?.x;
  const step2TopPosition = step2Position?.y;
  const step2LeftPosition = step2Position?.width + step2Position?.x;
  const step3TopPosition = step3Position?.y;
  const step3LeftPosition = step3Position?.width + step3Position?.x;

  const redDotStyles = () => {
    switch (walkthroughCurrentStep) {
      case 0:
        return {
          top: step1TopPosition,
          left: step1LeftPosition,
        };
      case 1:
        return {
          top: step2TopPosition,
          left: step2LeftPosition,
        };
      case 2:
        return {
          top: step3TopPosition,
          left: step3LeftPosition,
        };

      default:
        return {
          top: step1TopPosition,
          left: step1LeftPosition,
        };
    }
  };

  const redDot = (
    <RedDotPortal>
      <div className={css.redDotWrapper} style={redDotStyles()}>
        <div className={css.redDot}></div>
      </div>
    </RedDotPortal>
  );

  return (
    <PopupModal
      id="OnboardingOrderModal"
      isOpen={isOpen}
      handleClose={onClose}
      customHeader={<div></div>}
      containerClassName={css.slideModalContainer}>
      <div className={css.modalContent}>
        <div className={classNames(css.sectionWrapper, css.topSection)}>
          <div className={css.daySession}>Bữa trưa</div>
          <div className={css.orderStatus}>
            <Badge
              className={css.badge}
              type={EBadgeType.warning}
              label="Chưa chọn món"
            />
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
          <Button
            data-tour="step-1"
            className={classNames(css.btn, css.confirmBtn)}>
            Chọn món
          </Button>
          <Button
            className={classNames(css.btn, css.pickForMeBtn)}
            variant="secondary"
            data-tour="step-2">
            Chọn giúp tôi
          </Button>
          <Button
            data-tour="step-3"
            className={classNames(css.btn, css.lastBtn)}
            variant="inline">
            <span ref={step2Ref}>
              Không tham gia
              {isDuringTour && walkthroughCurrentStep === 1 && redDot}
            </span>
          </Button>
        </div>
      </div>
    </PopupModal>
  );
};

export default OnboardingOrderModal;
