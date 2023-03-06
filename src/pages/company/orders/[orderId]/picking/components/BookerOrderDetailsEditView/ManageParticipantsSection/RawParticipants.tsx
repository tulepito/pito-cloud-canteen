import Tooltip from '@components/Tooltip/Tooltip';
import { Listing } from '@src/utils/data';
import type { TListing, TObject, TUser } from '@utils/types';

import { isParticipantCompletedPickFood } from './ManageParticipantsSection.helper';
import ParticipantCard from './ParticipantCard';

import css from './ManageParticipantsModal.module.scss';

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
  const { orderDetail: planOrderDetails } = Listing(
    planData as TListing,
  ).getMetadata();

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
            participant={item}
            hasCheckIcon={isSelectedFood}
          />
        );

        return isSelectedFood ? (
          <Tooltip
            overlayClassName={css.tooltipOverlay}
            tooltipContent={'Đã chọn món xong'}
            placement="topRight"
            key={uuid}>
            {cardComponent}
          </Tooltip>
        ) : (
          cardComponent
        );
      })}
    </div>
  );
};
