import Button from '@components/Button/Button';
import AlertModal from '@components/Modal/AlertModal';
import classNames from 'classnames';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import AddParticipantForm from './AddParticipantForm';
import css from './BookerOrderDetailsManageParticipantsSection.module.scss';
import BookerOrderDetailsParticipantCard from './BookerOrderDetailsParticipantCard';
import ManageParticipantsModal from './ManageParticipantsModal';

type BookerOrderDetailsManageParticipantsSectionProps = {
  rootClassName?: string;
  className?: string;
};

const BookerOrderDetailsManageParticipantsSection: React.FC<
  BookerOrderDetailsManageParticipantsSectionProps
> = (props) => {
  const intl = useIntl();
  const [isDeleteParticipantModalOpen, setIsDeleteParticipantModalOpen] =
    useState(false);
  const [isManageParticipantsModalOpen, setIsManageParticipantsModalOpen] =
    useState(false);

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

  const handleClickDeleteParticipant = (id: string) => () => {
    console.log('id', id);
    setIsDeleteParticipantModalOpen(true);
  };
  const handleCloseDeleteParticipantModal = () => {
    setIsDeleteParticipantModalOpen(false);
  };
  const handleConfirmDeleteParticipant = () => {
    setIsDeleteParticipantModalOpen(false);
  };
  const handleCancelDeleteParticipant = () => {
    setIsDeleteParticipantModalOpen(false);
  };

  const handleClickViewMoreParticipants = () => {
    setIsManageParticipantsModalOpen(true);
  };
  const handleCloseManageParticipantModal = () => {
    setIsManageParticipantsModalOpen(false);
  };

  return (
    <div className={rootClasses}>
      <div>{sectionTitle}</div>

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
      <Button
        variant="inline"
        className={css.viewDetailBtn}
        onClick={handleClickViewMoreParticipants}>
        {viewDetailText}
      </Button>

      <AlertModal
        title={deleteParticipantPopupTitle}
        isOpen={isDeleteParticipantModalOpen}
        handleClose={handleCloseDeleteParticipantModal}
        cancelLabel={cancelDeleteParticipantText}
        confirmLabel={confirmDeleteParticipantText}
        onCancel={handleCancelDeleteParticipant}
        onConfirm={handleConfirmDeleteParticipant}>
        <div>{deleteParticipantPopupQuestion}</div>
      </AlertModal>

      <ManageParticipantsModal
        isOpen={isManageParticipantsModalOpen}
        onClose={handleCloseManageParticipantModal}
      />
    </div>
  );
};

export default BookerOrderDetailsManageParticipantsSection;
