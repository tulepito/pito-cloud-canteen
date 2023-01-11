import css from './BookerOrderDetails.module.scss';
import BookerOrderDetailsCountdownSection from './BookerOrderDetailsCountdownSection/BookerOrderDetailsCountdownSection';
import BookerOrderDetailsManageParticipantsSection from './BookerOrderDetailsManageParticipantsSection/BookerOrderDetailsManageParticipantsSection';
import BookerOrderDetailsOrderLinkSection from './BookerOrderDetailsOrderLinkSection/BookerOrderDetailsOrderLinkSection';
import BookerOrderDetailsTitle from './BookerOrderDetailsTitle/BookerOrderDetailsTitle';

const BookerOrderDetailsPage = () => {
  return (
    <div className={css.root}>
      <BookerOrderDetailsTitle className={css.titlePart} />

      <div className={css.leftPart}> Manage food selection</div>
      <div className={css.rightPart}>
        <BookerOrderDetailsCountdownSection className={css.container} />
        <BookerOrderDetailsOrderLinkSection className={css.container} />
        <BookerOrderDetailsManageParticipantsSection
          className={css.container}
        />
      </div>
    </div>
  );
};

export default BookerOrderDetailsPage;
