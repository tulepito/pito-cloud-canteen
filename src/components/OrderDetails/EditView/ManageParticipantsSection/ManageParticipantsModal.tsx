import { useIntl } from 'react-intl';

import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { isCompletePickFood } from '@helpers/orderHelper';
import { useViewport } from '@hooks/useViewport';
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
  ableToUpdateOrder: boolean;
  onSubmitAddParticipant: (values: TAddParticipantFormValues) => void;
};

const ManageParticipantsModal: React.FC<ManageParticipantsModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    onSubmitAddParticipant,
    handleClickDeleteParticipant,
    data,
    ableToUpdateOrder,
  } = props;
  const intl = useIntl();
  const { isMobileLayout } = useViewport();

  const { participants = [] } = data;
  const { orderDetail = {} } = Listing(data.planData as TListing).getMetadata();
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

  const content = (
    <>
      <div className={css.subTitle}>{modalSubTitle}</div>
      <AddParticipantForm
        id="ManageParticipantsModal.AddParticipantForm"
        onSubmit={onSubmitAddParticipant}
        hasSubmitButton
        ableToUpdateOrder={ableToUpdateOrder}
      />
      <div className={css.participantsContainer}>
        <RawParticipants
          data={data}
          handleClickDeleteParticipant={handleClickDeleteParticipant}
        />
      </div>
    </>
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <SlideModal
        id="ManageParticipantsMobileModal"
        modalTitle={modalTitle}
        onClose={onClose}
        isOpen={isOpen}>
        {content}
      </SlideModal>

      <RenderWhen.False>
        <Modal
          className={css.root}
          isOpen={isOpen}
          handleClose={onClose}
          containerClassName={css.modalContainer}
          title={modalTitle}>
          {content}
        </Modal>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default ManageParticipantsModal;
