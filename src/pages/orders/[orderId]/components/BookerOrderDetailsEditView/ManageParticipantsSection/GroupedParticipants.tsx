import Collapsible from '@components/Collapsible/Collapsible';
import { FormattedMessage } from 'react-intl';

import css from './ManageParticipantsModal.module.scss';
import ParticipantCard from './ParticipantCard';

// const groupedMockupData = [
//   { name: 'Group A', participants: [1, 3, 4, 5] },
//   { name: 'Group B', participants: [1, 3, 4, 1, 1, 1, 1, 1] },
// ];

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
                  <ParticipantCard
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
