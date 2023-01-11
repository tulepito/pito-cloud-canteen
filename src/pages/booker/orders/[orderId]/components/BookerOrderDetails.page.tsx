import css from './BookerOrderDetails.module.scss';
import BookerOrderDetailsCountdownSection from './BookerOrderDetailsCountdownSection/BookerOrderDetailsCountdownSection';
import BookerOrderDetailsTitle from './BookerOrderDetailsTitle/BookerOrderDetailsTitle';

const BookerOrderDetailsPage = () => {
  return (
    <div className={css.root}>
      <BookerOrderDetailsTitle className={css.titlePart} />

      <div className={css.leftPart}> Manage food selection</div>
      <div className={css.rightPart}>
        <BookerOrderDetailsCountdownSection className={css.container} />
        <div className={css.container}>Link</div>
        <div className={css.container}>Participants</div>
      </div>
    </div>
  );
};

export default BookerOrderDetailsPage;
