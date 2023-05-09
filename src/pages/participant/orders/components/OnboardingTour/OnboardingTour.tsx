import { useState } from 'react';
import dynamic from 'next/dynamic';

import IconCloseSquare from '@components/Icons/IconCloseSquare/IconCloseSquare';
import { useAppDispatch } from '@hooks/reduxHooks';

import { OrderListActions } from '../../OrderList.slice';

import css from './OnboardingTour.module.scss';

const Tour = dynamic<any>(() => import('reactour'), { ssr: false });

const tourConfig = [
  {
    selector: '[data-tour="step-1"]',
    content: ({ step }: any) => (
      <div>
        <div className={css.step}>{`${step}/3`}</div>
        <div className={css.stepTitle}>Chọn món </div>
        <div className={css.stepContent}>
          Chọn nhanh món bạn muốn ăn trong ngày và &ldquo;Xác nhận chọn
          món&rdquo; nhé
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#ffecea',
      '&::after': {
        content: '',
        position: 'absolute',
        bottom: '0',
        left: '16px',
        transform: 'matrix(1, 0, 0, -1, 0, 0)',
        width: 10,
        height: 6,
      },
    },
  },
  {
    selector: '[data-tour="step-2"]',
    content: ({ step }: any) => (
      <div>
        <div className={css.step}>{`${step}/3`}</div>
        <div>Bỏ chọn ngày này</div>
        <div className={css.stepContent}>
          Nếu không ăn ngày này, bạn chọn &ldquo;Không tham gia&rdquo;.
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#ffecea',
      '&::after': {
        content: '',
        position: 'absolute',
        bottom: '0',
        left: '16px',
        transform: 'matrix(1, 0, 0, -1, 0, 0)',
        width: 10,
        height: 6,
      },
    },
  },
  {
    selector: '[data-tour="step-3"]',
    content: ({ step }: any) => (
      <div>
        <div className={css.step}>{`${step}/3`}</div>
        <div>Xem chi tiết</div>
        <div className={css.stepContent}>
          Bạn đã chọn món gì, xem lại thực đơn nhé!
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#ffecea',
      '&::after': {
        content: '',
        position: 'absolute',
        bottom: '0',
        left: '16px',
        transform: 'matrix(1, 0, 0, -1, 0, 0)',
        width: 10,
        height: 6,
      },
    },
  },
];

type TOnboardingTourProps = {
  isTourOpen: boolean;
  closeTour: () => void;
};
const OnboardingTour: React.FC<TOnboardingTourProps> = (props) => {
  const { isTourOpen, closeTour } = props;
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(0);

  const onGetCurrentStep = (step: number) => {
    setCurrentStep(step);
    dispatch(OrderListActions.changeWalkthroughCurrentStep(step));
  };
  const onCloseTour = (e: any) => {
    e.stopPropagation();
    setCurrentStep(0);
    closeTour();
  };
  const NextButton = ({ onClick }: any) => (
    <div className={css.nextBtn} onClick={onClick}>
      Tiếp theo
    </div>
  );
  const LastStepNextButton = () => (
    <div className={css.nextBtn} onClick={onCloseTour}>
      Hoàn tất
    </div>
  );
  const SkipButton = () => (
    <div className={css.skipBtn} onClick={onCloseTour}>
      <IconCloseSquare />
      Bỏ qua hướng dẫn
    </div>
  );

  return (
    <Tour
      steps={tourConfig as any}
      isOpen={isTourOpen}
      rounded={12}
      onRequestClose={onCloseTour}
      disableDotsNavigation
      disableKeyboardNavigation
      showNumber={false}
      showCloseButton={false}
      getCurrentStep={onGetCurrentStep}
      goToStep={currentStep}
      nextButton={<NextButton />}
      lastStepNextButton={<LastStepNextButton />}
      prevButton={<SkipButton />}
      showNavigation={false}
    />
  );
};

export default OnboardingTour;
