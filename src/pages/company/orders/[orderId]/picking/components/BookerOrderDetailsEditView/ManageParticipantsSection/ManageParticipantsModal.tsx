import Modal from '@components/Modal/Modal';
import type { TObject, TUser } from '@utils/types';
import { useIntl } from 'react-intl';

import type { TAddParticipantFormValues } from './AddParticipantForm';
import AddParticipantForm from './AddParticipantForm';
import css from './ManageParticipantsModal.module.scss';
import { RawParticipants } from './RawParticipants';

type ManageParticipantsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleClickDeleteParticipant: (id: string) => () => void;
  data: {
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
  const count = 0;

  const modalTitle = intl.formatMessage(
    { id: 'ManageParticipantModal.title' },
    { count: 0 },
  );
  const modalSubTitle =
    count > 0
      ? intl.formatMessage({
          id: 'ManageParticipantModal.subTitle.hasChoices',
        })
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
      <AddParticipantForm onSubmit={onSubmitAddParticipant} hasSubmitButton />
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
