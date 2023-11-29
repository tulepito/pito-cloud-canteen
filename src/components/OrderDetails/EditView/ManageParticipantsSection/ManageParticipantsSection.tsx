import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import type { TDefaultProps, TObject, TUser } from '@utils/types';

import type { TAddParticipantFormValues } from './AddParticipantForm';
import AddParticipantForm from './AddParticipantForm';
import AlertConfirmDeleteParticipant from './AlertConfirmDeleteParticipant';
import ManageParticipantsModal from './ManageParticipantsModal';
import ParticipantCard from './ParticipantCard';

import css from './ManageParticipantsSection.module.scss';

export const renderParticipantCards = (
  items: Array<TUser>,
  handleClickDeleteParticipant: (id: string) => () => void,
  ableToUpdateOrder: boolean,
) => {
  return items.map((item) => {
    const {
      id: { uuid },
      attributes: {
        email,
        profile: { firstName, lastName },
      },
    } = item;

    return (
      <ParticipantCard
        name={`${lastName} ${firstName}`}
        email={email}
        key={uuid}
        participant={item}
        onClickDeleteIcon={handleClickDeleteParticipant(uuid)}
        ableToRemove={ableToUpdateOrder}
      />
    );
  });
};

type TManageParticipantsSectionProps = TDefaultProps & {
  data: {
    participants: string[];
    participantData: Array<TUser>;
    planData: TObject;
  };
  ableToUpdateOrder: boolean;
};

const ManageParticipantsSection: React.FC<TManageParticipantsSectionProps> = (
  props,
) => {
  const { rootClassName, className, data, ableToUpdateOrder } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [currentParticipantId, setCurrentParticipantId] = useState<string>();
  const [isDeleteParticipantModalOpen, setIsDeleteParticipantModalOpen] =
    useState(false);
  const manageParticipantsModalControl = useBoolean();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const updateParticipantsInProgress = useAppSelector(
    (state) => state.OrderManagement.updateParticipantsInProgress,
  );

  const rootClasses = classNames(rootClassName || css.root, className);

  const { participantData } = data;
  const disableButton = inProgress;

  const sectionTitle = intl.formatMessage({
    id: 'ManageParticipantsSection.title',
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

  const handleSubmitAddParticipant = async ({
    email,
  }: TAddParticipantFormValues) => {
    if (updateParticipantsInProgress) {
      return;
    }

    const { meta, payload } = (await dispatch(
      orderManagementThunks.addParticipant({ email }),
    )) as any;

    if (meta.requestStatus === 'rejected') {
      return { email: payload };
    }
  };

  return (
    <div className={rootClasses}>
      <div className={css.titleContainer}>
        {sectionTitle}

        <RenderWhen condition={participantData.length > 0}>
          <span className={css.participantCount}>{participantData.length}</span>
        </RenderWhen>
      </div>

      <AddParticipantForm
        id="ManageParticipantsSection.AddParticipantForm"
        onSubmit={handleSubmitAddParticipant}
        ableToUpdateOrder={ableToUpdateOrder}
      />
      <div className={css.participantContainer}>
        {renderParticipantCards(
          participantData.slice(0, 4),
          handleClickDeleteParticipant,
          ableToUpdateOrder,
        )}
      </div>
      <Button
        variant="inline"
        className={css.viewDetailBtn}
        onClick={manageParticipantsModalControl.setTrue}>
        {viewDetailText}
      </Button>

      <AlertConfirmDeleteParticipant
        cancelDisabled={disableButton}
        confirmDisabled={disableButton}
        isOpen={isDeleteParticipantModalOpen}
        onClose={handleCloseDeleteParticipantModal}
        onCancel={handleCancelDeleteParticipant}
        onConfirm={handleConfirmDeleteParticipant}
      />

      <ManageParticipantsModal
        data={data}
        isOpen={manageParticipantsModalControl.value}
        onClose={manageParticipantsModalControl.setFalse}
        handleClickDeleteParticipant={handleClickDeleteParticipant}
        onSubmitAddParticipant={handleSubmitAddParticipant}
        ableToUpdateOrder={ableToUpdateOrder}
      />
    </div>
  );
};

export default ManageParticipantsSection;
