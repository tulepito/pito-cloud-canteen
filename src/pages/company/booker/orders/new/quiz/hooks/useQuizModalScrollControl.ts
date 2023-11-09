import { useRef } from 'react';

export const useQuizModalScrollControl = () => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  const scrollDown = (scrollYBy: number) => {
    modalContentRef.current?.scrollBy({
      top: scrollYBy,
      behavior: 'smooth',
    });
  };

  const onClickOrderDates = (scrollBy?: number) => {
    setTimeout(() => {
      scrollDown(scrollBy || 80);
    }, 0);
  };

  const onClickDeliveryHour = () => {
    setTimeout(() => {
      scrollDown(100);
    }, 0);
  };

  const onClickIsGroupOrder = () => {
    setTimeout(() => {
      scrollDown(100);
    }, 0);
  };

  const onClickDeadlineDate = () => {
    setTimeout(() => {
      scrollDown(500);
    }, 0);
  };

  return {
    modalContentRef,
    onClickOrderDates,
    onClickDeliveryHour,
    onClickIsGroupOrder,
    onClickDeadlineDate,
  };
};
