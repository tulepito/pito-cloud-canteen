import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppSelector } from '@hooks/reduxHooks';

import { orderDetailsAnyActionsInProgress } from '../BookerOrderManagement.slice';
import css from './BookerOrderDetails.module.scss';
import BookerOrderDetailsCountdownSection from './BookerOrderDetailsCountdownSection/BookerOrderDetailsCountdownSection';
import BookerOrderDetailsManageOrdersSection from './BookerOrderDetailsManageOrdersSection/BookerOrderDetailsManageOrdersSection';
import BookerOrderDetailsManageParticipantsSection from './BookerOrderDetailsManageParticipantsSection/BookerOrderDetailsManageParticipantsSection';
import BookerOrderDetailsOrderLinkSection from './BookerOrderDetailsOrderLinkSection/BookerOrderDetailsOrderLinkSection';
import BookerOrderDetailsTitle from './BookerOrderDetailsTitle/BookerOrderDetailsTitle';

const BookerOrderDetailsPage = () => {
  const { orderData, planData, participantData } = useAppSelector(
    (state) => state.BookerOrderManagement,
  );
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const { generalInfo = {} } = orderData?.attributes?.metadata || {};
  const {
    startDate = 0,
    endDate = 0,
    deliveryHour,
    deliveryAddress,
    orderDeadline = 0,
    deadlineHour,
  } = generalInfo || {};

  const titleSectionData = { deliveryHour, deliveryAddress };
  const countdownSectionData = { deadlineHour, orderDeadline, startDate };
  const linkSectionData = { orderDeadline };
  const manageParticipantData = {
    planData,
    participantData,
  };
  const manageOrdersData = {
    planData,
    startDate,
    endDate,
  };

  return (
    <>
      {inProgress ? (
        <LoadingContainer />
      ) : (
        <div className={css.root}>
          <BookerOrderDetailsTitle
            className={css.titlePart}
            data={titleSectionData}
          />

          <div className={css.leftPart}>
            <BookerOrderDetailsManageOrdersSection data={manageOrdersData} />
          </div>
          <div className={css.rightPart}>
            <BookerOrderDetailsCountdownSection
              className={css.container}
              data={countdownSectionData}
            />
            <BookerOrderDetailsOrderLinkSection
              className={css.container}
              data={linkSectionData}
            />
            <BookerOrderDetailsManageParticipantsSection
              className={css.container}
              data={manageParticipantData}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BookerOrderDetailsPage;
