import type { PropsWithChildren } from 'react';
import { TourProvider } from '@reactour/tour';

import IconCloseSquare from '@components/Icons/IconCloseSquare/IconCloseSquare';
import { useAppDispatch } from '@hooks/reduxHooks';
import { UIActions } from '@redux/slices/UI.slice';

import css from './WalkThroughTour.module.scss';

const tourConfig = [
  {
    selector: '[data-tour="step-1"]',
    content: ({ currentStep }: any) => (
      <div>
        <div className={css.step}>{`${currentStep + 1}/5`}</div>
        <div className={css.stepTitle}>Đây là nhà hàng gợi ý cho bạn</div>
        <div className={css.stepContent}>
          Nhà hàng được đề xuất dựa theo nhu cầu của bạn và đánh giá tích cực từ
          khách hàng
        </div>
      </div>
    ),
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: '20px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: 8,
      }),
    },
    position: 'right',
  },
  {
    selector: '[data-tour="step-2"]',
    content: ({ currentStep }: any) => (
      <div>
        <div className={css.step}>{`${currentStep + 1}/5`}</div>
        <div className={css.stepTitle}>Tự động Gợi ý nhà hàng khác</div>
        <div className={css.stepContent}>
          Nếu chưa phù hợp, bạn có thể thay đổi ngẫu nhiên với 300+ nhà hàng
          khác
        </div>
      </div>
    ),
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: '20px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: '100%',
      }),
    },
    position: 'right',
    padding: 10,
  },
  {
    selector: '[data-tour="step-3"]',
    content: ({ currentStep }: any) => (
      <div>
        <div className={css.step}>{`${currentStep + 1}/5`}</div>
        <div className={css.stepTitle}>Tìm kiếm nhà hàng </div>
        <div className={css.stepContent}>
          Hoặc bạn thử tìm tên một nhà hàng mà bạn muốn đặt món nhé!
        </div>
      </div>
    ),
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: '100%',
      }),
    },
    position: 'right',
    padding: 10,
  },
  {
    selector: '[data-tour="step-4"]',
    content: ({ currentStep }: any) => (
      <div>
        <div className={css.step}>{`${currentStep + 1}/5`}</div>
        <div className={css.stepTitle}>Xoá bữa ăn này</div>
        <div className={css.stepContent}>
          Bạn có thể xoá nhà hàng đã chọn trong trường muốn thay đổi ngày ăn
        </div>
      </div>
    ),
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: '20px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: '100%',
      }),
    },
    position: 'right',
    padding: 10,
  },
  {
    selector: '[data-tour="step-5"]',
    content: ({ currentStep }: any) => (
      <div>
        <div className={css.step}>{`${currentStep + 1}/5`}</div>
        <div className={css.stepTitle}>Chọn các món ăn trong menu</div>
        <div className={css.stepContent}>
          &ldquo;Hôm nay ăn gì?&rdquo; Bạn xem ở đây nhé!
        </div>
      </div>
    ),
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: '20px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: 8,
      }),
    },
    position: 'right',
  },
];

type TWalkThroughTourProps = PropsWithChildren & {
  onCloseTour: () => void;
};

const WalkThroughTourProvider: React.FC<TWalkThroughTourProps> = (props) => {
  const { onCloseTour } = props;
  const dispatch = useAppDispatch();
  const disableBody = () => {
    dispatch(UIActions.disableScrollRequest('walkthrough'));
  };
  const enableBody = () => {
    dispatch(UIActions.disableScrollRemove('walkthrough'));
  };

  const NextButton = ({
    setCurrentStep,
    currentStep,
    stepsLength,
    setIsOpen,
  }: any) => {
    const lastStep = currentStep === stepsLength - 1;
    const handleClick = () => {
      if (lastStep) {
        setIsOpen(false);
        onCloseTour();
      } else {
        setCurrentStep(currentStep + 1);
      }
    };

    return (
      <div className={css.nextBtn} onClick={handleClick}>
        {lastStep ? 'Hoàn tất' : 'Tiếp theo'}
      </div>
    );
  };
  const SkipButton = ({ setIsOpen }: any) => {
    const handleClick = () => {
      setIsOpen(false);
      onCloseTour();
    };

    return (
      <div className={css.skipBtn} onClick={handleClick}>
        <IconCloseSquare />
        Bỏ qua hướng dẫn
      </div>
    );
  };

  return (
    <TourProvider
      nextButton={(nextBtnProps: any) => <NextButton {...nextBtnProps} />}
      prevButton={(prevBtnProps: any) => <SkipButton {...prevBtnProps} />}
      padding={0}
      afterOpen={disableBody}
      beforeClose={enableBody}
      maskClassName={css.mask}
      showDots={false}
      showBadge={false}
      steps={tourConfig as any}>
      {props.children}
    </TourProvider>
  );
};

export default WalkThroughTourProvider;
