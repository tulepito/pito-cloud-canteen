import ParticipantCard from '@components/OrderDetails/EditView/ManageParticipantsSection/ParticipantCard';
import { useAppSelector } from '@hooks/reduxHooks';
import { User } from '@src/utils/data';
import type { TUser } from '@src/utils/types';

import css from './ParticipantList.module.scss';

type TParticipantListProps = {};

const ParticipantList: React.FC<TParticipantListProps> = () => {
  const participantData = useAppSelector(
    (state) => state.BookerDraftOrderPage.participantData,
  );

  const handleDeleteParticipant = (userId: string) => () => {
    console.debug('💫 > handleClickDeleteParticipant > userId: ', userId);
  };

  return (
    <div className={css.root}>
      {participantData.map((p) => {
        const participantGetter = User(p as TUser);
        const participantId = participantGetter.getId();
        const { firstName, lastName } = participantGetter.getProfile();
        const { email } = participantGetter.getAttributes();

        return (
          <ParticipantCard
            key={participantId}
            name={`${lastName} ${firstName}`}
            email={email}
            participant={p as TUser}
            ableToRemove
            onClickDeleteIcon={handleDeleteParticipant(participantId)}
          />
        );
      })}
    </div>
  );
};

export default ParticipantList;
