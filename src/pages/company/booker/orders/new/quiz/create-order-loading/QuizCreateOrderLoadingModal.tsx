import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import type { StaticImageData } from 'next/image';

import Modal from '@components/Modal/Modal';
import NamedLink from '@components/NamedLink/NamedLink';
import { useAppSelector } from '@hooks/reduxHooks';
import initializingOrder from '@src/assets/initializingOrder.webp';
import menuIncoming from '@src/assets/menuIncoming.webp';
import redirectToCalendarPage from '@src/assets/redirectToCalendarPage.webp';
import waitingAlitteBit from '@src/assets/waitingAlitteBit.webp';
import { companyPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import type { TListing } from '@src/utils/types';

import css from './QuizCreateOrderLoadingModal.module.scss';

type QuizCreateOrderLoadingModalProps = {
  creatingOrderError: boolean;
};

const middleLoadingSteps = [
  'QuizCreatingOrderPage.menuIncoming',
  'QuizCreatingOrderPage.waitingAlitteBit',
  'QuizCreatingOrderPage.redirectToCalendarPage',
];

const QuizCreateOrderLoadingModal: React.FC<
  QuizCreateOrderLoadingModalProps
> = ({ creatingOrderError }) => {
  const intl = useIntl();
  const [loadingText, setLoadingText] = useState<string>(middleLoadingSteps[0]);
  const loadingTextIndex = useRef<number>(0);

  const createOrderInProcess = useAppSelector(
    (state) => state.Order.createOrderInProcess,
  );
  const recommendRestaurantInProgress = useAppSelector(
    (state) => state.Order.recommendRestaurantInProgress,
  );

  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const { startDate, endDate } = quizData;
  const orderTitle = Listing(order as TListing).getAttributes().title;
  const initialOrderDetailInProgress =
    recommendRestaurantInProgress || updateOrderDetailInProgress;
  const formattedStartDate =
    startDate && formatTimestamp(new Date(startDate).getTime(), 'd MMMM');
  const formattedEndDate =
    endDate && formatTimestamp(new Date(endDate).getTime(), 'd MMMM');

  useEffect(() => {
    if (initialOrderDetailInProgress) {
      const intervalId = setInterval(() => {
        if (loadingTextIndex.current < middleLoadingSteps.length) {
          setLoadingText(middleLoadingSteps[loadingTextIndex.current++]);
        } else {
          clearInterval(intervalId);
        }
      }, 1000);
    }
  }, [initialOrderDetailInProgress]);

  const message = createOrderInProcess
    ? intl.formatMessage({
        id: 'QuizCreatingOrderPage.initializingOrder',
      })
    : initialOrderDetailInProgress
    ? intl.formatMessage({
        id: loadingText,
      })
    : orderTitle && !initialOrderDetailInProgress
    ? intl.formatMessage({
        id: 'QuizCreatingOrderPage.redirectToCalendarPage',
      })
    : creatingOrderError
    ? intl.formatMessage({
        id: 'QuizCreatingOrderPage.initializeOrderError',
      })
    : '';

  const messageMap: Record<string, StaticImageData> = {
    initializingOrder,
    menuIncoming,
    waitingAlitteBit,
    redirectToCalendarPage,
  };

  const imageStyles: Record<
    string,
    { backgroundSize: string; backgroundPosition: string }
  > = {
    initializingOrder: {
      backgroundSize: '125%',
      backgroundPosition: '45% 38%',
    },
    menuIncoming: {
      backgroundSize: '120%',
      backgroundPosition: '45% 53%',
    },
    waitingAlitteBit: {
      backgroundSize: '132%',
      backgroundPosition: '57% 12%',
    },
    redirectToCalendarPage: {
      backgroundSize: '130%',
      backgroundPosition: '43% 49%',
    },
  };

  const renderLoadingImage = (
    messageKey: string,
    imageSrc: StaticImageData,
  ) => {
    const { backgroundSize, backgroundPosition } =
      imageStyles[messageKey] || {};

    return (
      <div
        className={`${css.loadingImage} ${
          message ===
          intl.formatMessage({ id: `QuizCreatingOrderPage.${messageKey}` })
            ? css.visible
            : css.hidden
        }`}
        style={{
          backgroundImage: `url(${imageSrc.src})`,
          backgroundSize: backgroundSize || '125%',
          backgroundPosition: backgroundPosition || '43% 49%',
        }}></div>
    );
  };

  return (
    <Modal
      isOpen
      containerClassName={css.modalContainer}
      shouldFullScreenInMobile={false}
      handleClose={() => {}}
      shouldHideIconClose>
      <div className={css.container}>
        {!creatingOrderError && (
          <div className={css.loadingImageWrapper}>
            {Object.keys(messageMap).map((key) =>
              renderLoadingImage(key, messageMap[key]),
            )}
          </div>
        )}

        <div className={css.initialOrderText}>{message}</div>

        {creatingOrderError && (
          <div className={css.error}>
            <NamedLink
              title={'Thử lại lần nữa'}
              params={{ pathanme: companyPaths.Home }}
            />
          </div>
        )}

        {orderTitle && !creatingOrderError && (
          <div className={css.orderTitle}>{`#${orderTitle}`}</div>
        )}

        {startDate && endDate && !creatingOrderError && (
          <div className={css.orderDateWrapper}>
            <span>
              {intl.formatMessage({
                id: 'QuizCreatingOrderPage.orderTimeRange',
              })}
            </span>
            <span
              className={
                css.orderDateRange
              }>{`${formattedStartDate} - ${formattedEndDate}`}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuizCreateOrderLoadingModal;
