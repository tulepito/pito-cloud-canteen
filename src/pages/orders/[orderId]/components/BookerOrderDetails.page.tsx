import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppSelector } from '@hooks/reduxHooks';

import css from './BookerOrderDetails.module.scss';
import BookerOrderDetailsCountdownSection from './BookerOrderDetailsCountdownSection/BookerOrderDetailsCountdownSection';
import BookerOrderDetailsManageOrdersSection from './BookerOrderDetailsManageOrdersSection/BookerOrderDetailsManageOrdersSection';
import BookerOrderDetailsManageParticipantsSection from './BookerOrderDetailsManageParticipantsSection/BookerOrderDetailsManageParticipantsSection';
import BookerOrderDetailsOrderLinkSection from './BookerOrderDetailsOrderLinkSection/BookerOrderDetailsOrderLinkSection';
import BookerOrderDetailsTitle from './BookerOrderDetailsTitle/BookerOrderDetailsTitle';

const BookerOrderDetailsPage = () => {
  const { orderData, /* planData */ participantData, isFetchingOrderDetail } =
    useAppSelector((state) => state.BookerOrderManagement);

  const { generalInfo = {} } = orderData?.attributes?.metadata || {};
  const {
    startDate = 0,
    deliveryHour,
    deliveryAddress,
    orderDeadline = 0,
  } = generalInfo || {};

  const titleSectionData = { deliveryHour, deliveryAddress };
  const countdownSectionData = {
    orderDeadline,
    startDate,
  };

  return (
    <>
      {isFetchingOrderDetail ? (
        <LoadingContainer />
      ) : (
        <div className={css.root}>
          <BookerOrderDetailsTitle
            className={css.titlePart}
            data={titleSectionData}
          />

          <div className={css.leftPart}>
            <BookerOrderDetailsManageOrdersSection />
          </div>
          <div className={css.rightPart}>
            <BookerOrderDetailsCountdownSection
              className={css.container}
              data={countdownSectionData}
            />
            <BookerOrderDetailsOrderLinkSection className={css.container} />
            <BookerOrderDetailsManageParticipantsSection
              className={css.container}
              data={participantData}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BookerOrderDetailsPage;
