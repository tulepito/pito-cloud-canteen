import { useIntl } from 'react-intl';

import Modal from '@components/Modal/Modal';
import { isCompletePickFood } from '@helpers/orderHelper';
import { Listing } from '@src/utils/data';
import type { TListing, TObject, TUser } from '@utils/types';

import type { TAddParticipantFormValues } from './AddParticipantForm';
import AddParticipantForm from './AddParticipantForm';
import { RawParticipants } from './RawParticipants';

import css from './ManageParticipantsModal.module.scss';

type ManageParticipantsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleClickDeleteParticipant: (id: string) => () => void;
  data: {
    participants: string[];
    participantData: Array<TUser>;
    planData: TObject;
  };

  onSubmitAddParticipant: (values: TAddParticipantFormValues) => void;
};

const ManageParticipantsModal: React.FC<ManageParticipantsModalProps> = (
  props,
) => {
  const intl = useIntl();
  const {
    isOpen,
    onClose,
    onSubmitAddParticipant,
    handleClickDeleteParticipant,
    data,
  } = props;

  const { participants = [] } = data;
  const { orderDetail } = Listing(data.planData as TListing).getMetadata();
  const numberOfCompletedPickings = participants.filter((participantId) =>
    isCompletePickFood({ participantId, orderDetail }),
  ).length;

  const modalTitle = (
    <span className={css.modalTitle}>
      {intl.formatMessage(
        { id: 'ManageParticipantModal.title' },
        { count: participants.length },
      )}
    </span>
  );
  const modalSubTitle =
    numberOfCompletedPickings > 0
      ? intl.formatMessage(
          {
            id: 'ManageParticipantModal.subTitle.hasChoices',
          },
          { count: numberOfCompletedPickings },
        )
      : intl.formatMessage({
          id: 'ManageParticipantModal.subTitle.noChoices',
        });

  return (
    <Modal
      className={css.root}
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      title={modalTitle}>
      <div className={css.subTitle}>{modalSubTitle}</div>
      <AddParticipantForm
        id="ManageParticipantsModal.AddParticipantForm"
        onSubmit={onSubmitAddParticipant}
        hasSubmitButton
      />
      <div className={css.participantsContainer}>
        <RawParticipants
          data={data}
          handleClickDeleteParticipant={handleClickDeleteParticipant}
        />
        {/* <GroupedParticipants groupedParticipants={groupedMockupData} /> */}
      </div>
    </Modal>
  );
};

export default ManageParticipantsModal;
