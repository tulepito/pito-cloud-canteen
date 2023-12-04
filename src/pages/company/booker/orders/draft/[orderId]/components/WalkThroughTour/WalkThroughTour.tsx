import { type PropsWithChildren } from 'react';
import { TourProvider } from '@reactour/tour';

import IconCloseSquare from '@components/Icons/IconCloseSquare/IconCloseSquare';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { UIActions } from '@redux/slices/UI.slice';

import { BookerDraftOrderPageActions } from '../../BookerDraftOrderPage.slice';

import css from './WalkThroughTour.module.scss';

const tourContent = [
  ({ currentStep }: any) => (
    <div>
      <div className={css.step}>{`${currentStep + 1}/5`}</div>
      <div className={css.stepTitle}>
        Đây là menu được tạo từ yêu cầu của bạn.
      </div>
      <div className={css.stepContent}>
        Menu được đề xuất dựa theo nhu cầu của bạn và đánh giá tích cực từ khách
        hàng
      </div>
    </div>
  ),
  ({ currentStep }: any) => (
    <div>
      <div className={css.step}>{`${currentStep + 1}/5`}</div>
      <div className={css.stepTitle}>Tự động đổi menu khác</div>
      <div className={css.stepContent}>
        Khi bạn bấm nút này, 1 menu mới sẽ được tạo dựa theo nhu cầu của bạn.
      </div>
    </div>
  ),
  ({ currentStep }: any) => (
    <div>
      <div className={css.step}>{`${currentStep + 1}/5`}</div>
      <div className={css.stepTitle}>Tìm kiếm nhà hàng </div>
      <div className={css.stepContent}>
        Bạn có thể tự tìm kiếm một nhà hàng khác với gợi ý của PITO Cloud
        Canteen.
      </div>
    </div>
  ),
  ({ currentStep }: any) => (
    <div>
      <div className={css.step}>{`${currentStep + 1}/5`}</div>
      <div className={css.stepTitle}>Xoá menu này</div>
      <div className={css.stepContent}>
        Bạn có thể xoá menu đã chọn cho ngày ăn. Bạn vẫn có thể thêm lại sau nếu
        muốn.
      </div>
    </div>
  ),
  ({ currentStep }: any) => (
    <div>
      <div className={css.step}>{`${currentStep + 1}/5`}</div>
      <div className={css.stepTitle}>Tùy chọn các món ăn</div>
      <div className={css.stepContent}>
        Bạn có thể thêm bớt món ăn trong menu.
      </div>
    </div>
  ),
];
const tourConfig = [
  {
    selector: '[data-tour="step-1"]',
    content: tourContent[0],
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
    content: tourContent[1],
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
    content: tourContent[2],
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
    content: tourContent[3],
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
    content: tourContent[4],
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

const mobileTourConfig = [
  {
    selector: '[data-tour="step-1"]',
    content: tourContent[0],
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: 0,
        top: '-11px',
        maxWidth: '337px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: 8,
      }),
    },
    position: 'top',
  },
  {
    selector: '[data-tour="step-2"]',
    content: tourContent[1],
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: 0,
        maxWidth: '304px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: '100%',
      }),
    },
    position: 'top',
    padding: 10,
  },
  {
    selector: '[data-tour="step-3"]',
    content: tourContent[2],
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: 0,
        maxWidth: '304px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: '100%',
      }),
    },
    position: 'top',
    padding: 10,
  },
  {
    selector: '[data-tour="step-4"]',
    content: tourContent[3],
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: 0,
        maxWidth: '304px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: '100%',
      }),
    },
    position: 'top',
    padding: 10,
  },
  {
    selector: '[data-tour="step-5"]',
    content: tourContent[4],
    styles: {
      popover: (base: any) => ({
        ...base,
        borderRadius: 8,
        left: 0,
        top: '-12px',
        maxWidth: '304px',
      }),
      maskArea: (base: any) => ({
        ...base,
        rx: 8,
      }),
    },
    position: 'top',
  },
];

type TWalkThroughTourProps = PropsWithChildren & {
  onCloseTour: () => void;
  isMobileLayout?: boolean;
};

const WalkThroughTourProvider: React.FC<TWalkThroughTourProps> = (props) => {
  const { onCloseTour } = props;
  const { isMobileLayout, isTabletLayout } = useViewport();

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
        dispatch(BookerDraftOrderPageActions.setWalkthroughStep(-1));
      } else {
        setCurrentStep(currentStep + 1);
        dispatch(
          BookerDraftOrderPageActions.setWalkthroughStep(currentStep + 1),
        );
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
      dispatch(BookerDraftOrderPageActions.setWalkthroughStep(-1));
    };

    return (
      <div className={css.skipBtn} onClick={handleClick}>
        <IconCloseSquare />
        Bỏ qua hướng dẫn
      </div>
    );
  };

  if (isMobileLayout || isTabletLayout) {
    return (
      <TourProvider
        key="mobile-tour"
        nextButton={(nextBtnProps: any) => <NextButton {...nextBtnProps} />}
        prevButton={(prevBtnProps: any) => <SkipButton {...prevBtnProps} />}
        padding={0}
        afterOpen={disableBody}
        beforeClose={enableBody}
        maskClassName={css.mask}
        showDots={false}
        showBadge={false}
        onClickMask={() => {}}
        steps={mobileTourConfig as any}>
        {props.children}
      </TourProvider>
    );
  }

  return (
    <TourProvider
      key="desktop-tour"
      nextButton={(nextBtnProps: any) => <NextButton {...nextBtnProps} />}
      prevButton={(prevBtnProps: any) => <SkipButton {...prevBtnProps} />}
      padding={0}
      afterOpen={disableBody}
      beforeClose={enableBody}
      maskClassName={css.mask}
      showDots={false}
      showBadge={false}
      onClickMask={() => {}}
      steps={tourConfig as any}>
      {props.children}
    </TourProvider>
  );
};

export default WalkThroughTourProvider;
