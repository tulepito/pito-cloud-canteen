import Button from '@components/Button/Button';
import AlertModal from '@components/Modal/AlertModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TObject, TUser } from '@utils/types';
import classNames from 'classnames';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import {
  BookerOrderManagementsThunks,
  orderDetailsAnyActionsInProgress,
} from '../../../BookerOrderManagement.slice';
import type { TAddParticipantFormValues } from './AddParticipantForm';
import AddParticipantForm from './AddParticipantForm';
import css from './BookerOrderDetailsManageParticipantsSection.module.scss';
import BookerOrderDetailsParticipantCard from './BookerOrderDetailsParticipantCard';
import ManageParticipantsModal from './ManageParticipantsModal';

export const renderParticipantCards = (
  items: Array<TUser>,
  handleClickDeleteParticipant: (id: string) => () => void,
) => {
  return items.map((item) => {
    const {
      id: { uuid },
      attributes: {
        email,
        profile: { displayName },
      },
    } = item;

    return (
      <BookerOrderDetailsParticipantCard
        name={displayName}
        email={email}
        key={uuid}
        onClickDeleteIcon={handleClickDeleteParticipant(uuid)}
      />
    );
  });
};

type BookerOrderDetailsManageParticipantsSectionProps = {
  rootClassName?: string;
  className?: string;
  data: {
    participantData: Array<TUser>;
    planData: TObject;
  };
};

const BookerOrderDetailsManageParticipantsSection: React.FC<
  BookerOrderDetailsManageParticipantsSectionProps
> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [currentParticipantId, setCurrentParticipantId] = useState<string>();
  const [isDeleteParticipantModalOpen, setIsDeleteParticipantModalOpen] =
    useState(false);
  const [isManageParticipantsModalOpen, setIsManageParticipantsModalOpen] =
    useState(false);
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const disableButton = inProgress;

  const { rootClassName, className, data } = props;
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

  const handleClickDeleteParticipant = (participantId: string) => () => {
    setCurrentParticipantId(participantId);
    setIsDeleteParticipantModalOpen(true);
  };
  const handleCloseDeleteParticipantModal = () => {
    setIsDeleteParticipantModalOpen(false);
  };
  const handleConfirmDeleteParticipant = () => {
    if (currentParticipantId) {
      dispatch(
        BookerOrderManagementsThunks.deleteParticipant({
          participantId: currentParticipantId,
        }),
      );
    }
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

  const handleSubmitAddParticipant = ({ email }: TAddParticipantFormValues) => {
    dispatch(BookerOrderManagementsThunks.addParticipant({ email }));
  };

  return (
    <div className={rootClasses}>
      <div>{sectionTitle}</div>

      <AddParticipantForm onSubmit={handleSubmitAddParticipant} />
      <div className={css.participantContainer}>
        {renderParticipantCards(
          data.participantData.slice(0, 4),
          handleClickDeleteParticipant,
        )}
      </div>
      <Button
        variant="inline"
        className={css.viewDetailBtn}
        onClick={handleClickViewMoreParticipants}>
        {viewDetailText}
      </Button>

      <AlertModal
        disabledCancelButton={disableButton}
        disabledConfirmButton={disableButton}
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
        data={data}
        handleClickDeleteParticipant={handleClickDeleteParticipant}
        onSubmitAddParticipant={handleSubmitAddParticipant}
      />
    </div>
  );
};

export default BookerOrderDetailsManageParticipantsSection;
