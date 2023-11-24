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
        <div className={css.stepTitle}>
          Đây là menu được tạo từ yêu cầu của bạn.
        </div>
        <div className={css.stepContent}>
          Menu được đề xuất dựa theo nhu cầu của bạn và đánh giá tích cực từ
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
        <div className={css.stepTitle}>Tự động đổi menu khác</div>
        <div className={css.stepContent}>
          Khi bạn bấm nút này, 1 menu mới sẽ được tạo dựa theo nhu cầu của bạn.
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
          Bạn có thể tự tìm kiếm một nhà hàng khác với gợi ý của PITO Cloud
          Canteen.
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
        <div className={css.stepTitle}>Xoá menu này</div>
        <div className={css.stepContent}>
          Bạn có thể xoá menu đã chọn cho ngày ăn. Bạn vẫn có thể thêm lại sau
          nếu muốn.
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
        <div className={css.stepTitle}>Tùy chọn các món ăn</div>
        <div className={css.stepContent}>
          Bạn có thể thêm bớt món ăn trong menu.
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
