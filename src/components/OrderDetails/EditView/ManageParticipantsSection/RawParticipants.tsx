import Tooltip from '@components/Tooltip/Tooltip';
import { isCompletePickFood } from '@helpers/orderHelper';
import { Listing } from '@src/utils/data';
import type { TPlan } from '@src/utils/orderTypes';
import type { TListing, TObject, TUser } from '@utils/types';

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
  const { orderDetail: planOrderDetails = {} } = Listing(
    planData as TListing,
  ).getMetadata();

  const orderDetailList = Object.values(
    planOrderDetails as TPlan['orderDetail'],
  );

  return (
    <div className={css.rawParticipants}>
      {participantData.map((item) => {
        const {
          id: { uuid },
          attributes: {
            email,
            profile: { firstName, lastName },
          },
        } = item;
        const isSelectedFood = isCompletePickFood({
          participantId: uuid,
          orderDetail: planOrderDetails,
        });

        const cardComponent = (
          <ParticipantCard
            name={`${lastName} ${firstName}`}
            email={email}
            className={css.participantCard}
            onClickDeleteIcon={handleClickDeleteParticipant(uuid)}
            key={uuid}
            participant={item}
            hasCheckIcon={isSelectedFood}
            ableToRemove
          />
        );

        const tooltipContent = (
          <div className={css.tooltipContent}>
            <div className={css.title}>Đã chọn món xong</div>
            {orderDetailList.length} bữa
          </div>
        );

        return isSelectedFood ? (
          <Tooltip
            overlayClassName={css.tooltipOverlay}
            tooltipContent={tooltipContent}
            placement="bottomLeft"
            key={uuid}>
            <div className={css.cardWrapper}>{cardComponent}</div>
          </Tooltip>
        ) : (
          cardComponent
        );
      })}
    </div>
  );
};
