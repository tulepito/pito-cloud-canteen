import Collapsible from '@components/Collapsible/Collapsible';
import Modal from '@components/Modal/Modal';
import Tooltip from '@components/Tooltip/Tooltip';
import type { TObject, TUser } from '@utils/types';
import get from 'lodash/get';
import { FormattedMessage, useIntl } from 'react-intl';

import AddParticipantForm from './AddParticipantForm';
import { isParticipantCompletedPickFood } from './BookerOrderDetailsManageParticipantsSection.helper';
import BookerOrderDetailsParticipantCard from './BookerOrderDetailsParticipantCard';
import css from './ManageParticipantsModal.module.scss';

// const groupedMockupData = [
//   { name: 'Group A', participants: [1, 3, 4, 5] },
//   { name: 'Group B', participants: [1, 3, 4, 1, 1, 1, 1, 1] },
// ];

type TRawParticipantsProps = {
  data: {
    participantData: Array<TUser>;
    planData: TObject;
  };
  handleClickDeleteParticipant: (id: string) => () => void;
};

const RawParticipants: React.FC<TRawParticipantsProps> = ({
  data,
  handleClickDeleteParticipant,
}) => {
  const { participantData, planData } = data;
  const planOrderDetails = get(planData, 'attributes.metadata.orderDetail');

  return (
    <div className={css.rawParticipants}>
      {participantData.map((item) => {
        const {
          id: { uuid },
          attributes: {
            email,
            profile: { displayName },
          },
        } = item;
        const isSelectedFood = isParticipantCompletedPickFood(
          uuid,
          planOrderDetails,
        );

        const cardComponent = (
          <BookerOrderDetailsParticipantCard
            name={displayName}
            email={email}
            className={css.participantCard}
            onClickDeleteIcon={handleClickDeleteParticipant(uuid)}
            key={uuid}
            hasCheckIcon={isSelectedFood}
          />
        );

        return isSelectedFood ? (
          cardComponent
        ) : (
          <Tooltip
            tooltipContent={'Đã chọn món xong'}
            placement="topRight"
            key={uuid}>
            {cardComponent}
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

export const GroupedParticipants: React.FC<TGroupedParticipantsProps> = ({
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
  handleClickDeleteParticipant: (id: string) => () => void;
  data: {
    participantData: Array<TUser>;
    planData: TObject;
  };
};

const ManageParticipantsModal: React.FC<ManageParticipantsModalProps> = (
  props,
) => {
  const intl = useIntl();
  const { isOpen, onClose, handleClickDeleteParticipant, data } = props;
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
      <AddParticipantForm onSubmit={() => {}} hasSubmitButton />
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
