import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import AlertModal from '@components/Modal/AlertModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TDefaultProps, TObject, TUser } from '@utils/types';

import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from '../../../OrderManagement.slice';

import type { TAddParticipantFormValues } from './AddParticipantForm';
import AddParticipantForm from './AddParticipantForm';
import ManageParticipantsModal from './ManageParticipantsModal';
import ParticipantCard from './ParticipantCard';

import css from './ManageParticipantsSection.module.scss';

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
      <ParticipantCard
        name={displayName}
        email={email}
        key={uuid}
        participant={item}
        onClickDeleteIcon={handleClickDeleteParticipant(uuid)}
      />
    );
  });
};

type TManageParticipantsSectionProps = TDefaultProps & {
  data: {
    participantData: Array<TUser>;
    planData: TObject;
  };
};

const ManageParticipantsSection: React.FC<TManageParticipantsSectionProps> = (
  props,
) => {
  const { rootClassName, className, data } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [currentParticipantId, setCurrentParticipantId] = useState<string>();
  const [isDeleteParticipantModalOpen, setIsDeleteParticipantModalOpen] =
    useState(false);
  const [isManageParticipantsModalOpen, setIsManageParticipantsModalOpen] =
    useState(false);

  const rootClasses = classNames(rootClassName || css.root, className);

  const { participantData } = data;
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const disableButton = inProgress;

  const sectionTitle = intl.formatMessage({
    id: 'ManageParticipantsSection.title',
  });

  const deleteParticipantPopupTitle = intl.formatMessage({
    id: 'ManageParticipantsSection.deleteParticipantPopup.title',
  });
  const deleteParticipantPopupQuestion = intl.formatMessage({
    id: 'ManageParticipantsSection.deleteParticipantPopup.confirmQuestion',
  });
  const cancelDeleteParticipantText = intl.formatMessage({
    id: 'ManageParticipantsSection.deleteParticipantPopup.cancel',
  });
  const confirmDeleteParticipantText = intl.formatMessage({
    id: 'ManageParticipantsSection.deleteParticipantPopup.confirm',
  });

  const viewDetailText = intl.formatMessage({
    id: 'ManageParticipantsSection.viewDetailText',
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
        orderManagementThunks.deleteParticipant({
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
    dispatch(orderManagementThunks.addParticipant({ email }));
  };

  return (
    <div className={rootClasses}>
      <div className={css.titleContainer}>
        {sectionTitle}
        {participantData.length && (
          <span className={css.participantCount}>{participantData.length}</span>
        )}
      </div>

      <AddParticipantForm onSubmit={handleSubmitAddParticipant} />
      <div className={css.participantContainer}>
        {renderParticipantCards(
          participantData.slice(0, 4),
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
        cancelDisabled={disableButton}
        confirmDisabled={disableButton}
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

export default ManageParticipantsSection;
