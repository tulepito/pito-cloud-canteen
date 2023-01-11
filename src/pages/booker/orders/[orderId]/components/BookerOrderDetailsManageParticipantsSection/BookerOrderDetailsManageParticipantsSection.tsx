import Button from '@components/Button/Button';
import AlertModal from '@components/Modal/AlertModal';
import classNames from 'classnames';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import BookerOrderDetailsParticipantCard from '../BookerOrderDetailsParticipantCard/BookerOrderDetailsParticipantCard';
import AddParticipantForm from './AddParticipantForm';
import css from './BookerOrderDetailsManageParticipantsSection.module.scss';

type BookerOrderDetailsManageParticipantsSectionProps = {
  rootClassName?: string;
  className?: string;
};

const BookerOrderDetailsManageParticipantsSection: React.FC<
  BookerOrderDetailsManageParticipantsSectionProps
> = (props) => {
  const intl = useIntl();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { rootClassName, className } = props;
  const rootClasses = classNames(rootClassName || css.root, className);

  const sectionTitle = intl.formatMessage(
    {
      id: 'BookerOrderDetailsManageParticipantsSection.title',
    },
    { total: 30 },
  );

  const deleteParticipantPopupTitle = intl.formatMessage({
    id: 'BookerOrderDetailsManageParticipantsSection.deleteParticipantPopup.title',
  });
  const deleteParticipantPopupQuestion = intl.formatMessage({
    id: 'BookerOrderDetailsManageParticipantsSection.deleteParticipantPopup.confirmQuestion',
  });
  const cancelDeleteParticipantText = intl.formatMessage({
    id: 'BookerOrderDetailsManageParticipantsSection.deleteParticipantPopup.cancel',
  });
  const confirmDeleteParticipantText = intl.formatMessage({
    id: 'BookerOrderDetailsManageParticipantsSection.deleteParticipantPopup.confirm',
  });

  const viewDetailText = intl.formatMessage({
    id: 'BookerOrderDetailsManageParticipantsSection.viewDetailText',
  });

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };
  const handleConfirmDeleteParticipant = () => {
    setIsPopupOpen(false);
  };
  const handleCancelDeleteParticipant = () => {
    setIsPopupOpen(false);
  };

  const handleClickDeleteParticipant = (id: string) => () => {
    console.log('id', id);
    setIsPopupOpen(true);
  };

  return (
    <div className={rootClasses}>
      <div>{sectionTitle}</div>
      <AlertModal
        title={deleteParticipantPopupTitle}
        isOpen={isPopupOpen}
        handleClose={handleClosePopup}
        cancelLabel={cancelDeleteParticipantText}
        confirmLabel={confirmDeleteParticipantText}
        onCancel={handleCancelDeleteParticipant}
        onConfirm={handleConfirmDeleteParticipant}>
        <div>{deleteParticipantPopupQuestion}</div>
      </AlertModal>
      <AddParticipantForm onSubmit={() => {}} />
      <div className={css.participantContainer}>
        <BookerOrderDetailsParticipantCard
          onClickDeleteIcon={handleClickDeleteParticipant}
        />
        <BookerOrderDetailsParticipantCard
          onClickDeleteIcon={handleClickDeleteParticipant}
        />
        <BookerOrderDetailsParticipantCard
          onClickDeleteIcon={handleClickDeleteParticipant}
        />
      </div>
      <Button variant="inline" className={css.viewDetailBtn}>
        {viewDetailText}
      </Button>
    </div>
  );
};

export default BookerOrderDetailsManageParticipantsSection;
