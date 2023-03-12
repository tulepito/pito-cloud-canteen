import { FormattedMessage } from 'react-intl';

import Collapsible from '@components/Collapsible/Collapsible';

import ParticipantCard from './ParticipantCard';

import css from './ManageParticipantsModal.module.scss';

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
