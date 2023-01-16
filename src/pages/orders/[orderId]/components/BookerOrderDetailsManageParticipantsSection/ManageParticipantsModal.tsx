import Collapsible from '@components/Collapsible/Collapsible';
import Modal from '@components/Modal/Modal';
import Tooltip from '@components/Tooltip/Tooltip';
import { FormattedMessage, useIntl } from 'react-intl';

import AddParticipantForm from './AddParticipantForm';
import BookerOrderDetailsParticipantCard from './BookerOrderDetailsParticipantCard';
import css from './ManageParticipantsModal.module.scss';

const rawMockupData = [1, 3, 4, 5, 1, 1, 1, 1, 1, 1, 1];
const groupedMockupData = [
  { name: 'Group A', participants: [1, 3, 4, 5] },
  { name: 'Group B', participants: [1, 3, 4, 1, 1, 1, 1, 1] },
];

type TRawParticipantsProps = {
  participants: any[];
};

const RawParticipants: React.FC<TRawParticipantsProps> = ({ participants }) => {
  return (
    <div className={css.rawParticipants}>
      {participants.map((number, index) => {
        const isSelectedFood = index % 3 === 0;

        return isSelectedFood ? (
          <BookerOrderDetailsParticipantCard
            className={css.participantCard}
            onClickDeleteIcon={() => () => console.log(index)}
            key={index}
            hasCheckIcon
          />
        ) : (
          <Tooltip
            tooltipContent={'Đã chọn món xong'}
            placement="topRight"
            key={index}>
            <BookerOrderDetailsParticipantCard
              className={css.participantCard}
              onClickDeleteIcon={() => () => console.log(index)}
            />
          </Tooltip>
        );
      })}
    </div>
  );
};

const formatGroupName = (groupName: string) => {
  return (
    <div className={css.groupName}>
      <FormattedMessage
        id={'ManageParticipantsModal.groupName'}
        values={{ groupName: <span className={css.name}>{groupName}</span> }}
      />
    </div>
  );
};

type TGroupedParticipantsProps = {
  groupedParticipants: any[];
};

const GroupedParticipants: React.FC<TGroupedParticipantsProps> = ({
  groupedParticipants,
}) => {
  return (
    <div className={css.groupedParticipants}>
      {groupedParticipants.map((groupData, groupIndex) => {
        const { participants, name } = groupData;

        return (
          <Collapsible
            className={css.groupContainer}
            key={groupIndex}
            label={formatGroupName(name)}>
            <div className={css.rawParticipants}>
              {participants.map((number: any, index: number) => {
                return (
                  <BookerOrderDetailsParticipantCard
                    className={css.participantCard}
                    onClickDeleteIcon={() => () => console.log(index)}
                    key={index}
                  />
                );
              })}
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};

type ManageParticipantsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ManageParticipantsModal: React.FC<ManageParticipantsModalProps> = (
  props,
) => {
  const intl = useIntl();
  const { isOpen, onClose } = props;
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
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      title={modalTitle}>
      <div className={css.subTitle}>{modalSubTitle}</div>
      <AddParticipantForm onSubmit={() => {}} hasSubmitButton />
      <div className={css.participantsContainer}>
        <RawParticipants participants={rawMockupData} />
        <GroupedParticipants groupedParticipants={groupedMockupData} />
      </div>
    </Modal>
  );
};

export default ManageParticipantsModal;
