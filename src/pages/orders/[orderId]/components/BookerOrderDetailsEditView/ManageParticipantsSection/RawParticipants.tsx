import Tooltip from '@components/Tooltip/Tooltip';
import type { TObject, TUser } from '@utils/types';
import get from 'lodash/get';

import css from './ManageParticipantsModal.module.scss';
import { isParticipantCompletedPickFood } from './ManageParticipantsSection.helper';
import ParticipantCard from './ParticipantCard';

type TRawParticipantsProps = {
  data: {
    participantData: Array<TUser>;
    planData: TObject;
  };
  handleClickDeleteParticipant: (id: string) => () => void;
};

export const RawParticipants: React.FC<TRawParticipantsProps> = ({
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
          <ParticipantCard
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
