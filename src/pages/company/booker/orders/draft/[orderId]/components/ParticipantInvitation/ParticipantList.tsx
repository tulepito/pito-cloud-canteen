import { useState } from 'react';
import difference from 'lodash/difference';

import AlertModal from '@components/Modal/AlertModal';
import ParticipantCard from '@components/OrderDetails/EditView/ManageParticipantsSection/ParticipantCard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { Listing, User } from '@src/utils/data';
import type { TObject, TUser } from '@src/utils/types';

import { BookerDraftOrderPageThunks } from '../../BookerDraftOrderPage.slice';

import css from './ParticipantList.module.scss';

type TParticipantListProps = {};

const ParticipantList: React.FC<TParticipantListProps> = () => {
  const dispatch = useAppDispatch();
  const deleteParticipantControl = useBoolean();
  const [currentParticipantId, setCurrentParticipantId] = useState<string>();
  const participantData = useAppSelector(
    (state) => state.BookerDraftOrderPage.participantData,
  );
  const order = useAppSelector((state) => state.Order.order);

  const orderGetter = Listing(order);
  const participantIds = participantData.map((p) => User(p as TUser).getId());

  const { nonAccountEmails = [] } = orderGetter.getMetadata();

  const handleDeleteParticipant = (userId: string) => () => {
    setCurrentParticipantId(userId);
    deleteParticipantControl.setTrue();
  };

  const handleCancelDeleteParticipant = () => {
    deleteParticipantControl.setFalse();
    setCurrentParticipantId(undefined);
  };

  const handleConfirmDeleteParticipant = () => {
    if (currentParticipantId) {
      dispatch(
        BookerDraftOrderPageThunks.deleteOrderParticipants({
          participantId: currentParticipantId,
          orderId: orderGetter.getId(),
          participants: difference(participantIds, [currentParticipantId]),
        }),
      );
    }
    deleteParticipantControl.setFalse();
  };

  return (
    <div className={css.root}>
      <div className={css.participantContainer}>
        {nonAccountEmails.map((email: string) => {
          return <ParticipantCard key={email} email={email} />;
        })}
        {participantData.map((p: TObject) => {
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

      <AlertModal
        title="Xoá thành viên"
        isOpen={deleteParticipantControl.value}
        cancelLabel="Huỷ"
        confirmLabel="Xoá thành viên"
        handleClose={handleCancelDeleteParticipant}
        onCancel={handleCancelDeleteParticipant}
        onConfirm={handleConfirmDeleteParticipant}>
        Bạn có chắc chắn muốn xoá thành viên này không?
      </AlertModal>
    </div>
  );
};

export default ParticipantList;
