import React from 'react';

// import { useIntl } from 'react-intl';
import ParticipantCard from '@components/OrderDetails/EditView/ManageParticipantsSection/ParticipantCard';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
// import { useViewport } from '@hooks/useViewport';
import { buildFullName } from '@pages/api/admin/scanner/[planId]/[timestamp]/scan.api';
import { User } from '@src/utils/data';
import type { TObject, TUser } from '@src/utils/types';

import css from './RemovedParticipantList.module.scss';

type TRemovedParticipantListProps = {
  onRestoreParticipant: (emails: string[]) => void;
};

const RemovedParticipantList = ({
  onRestoreParticipant,
}: TRemovedParticipantListProps) => {
  // const { isMobileLayout } = useViewport();
  // const intl = useIntl();
  const removedParticipantData = useAppSelector(
    (state) => state.BookerDraftOrderPage.removedParticipantData,
  );

  const handleRestoreParticipant = (participant: TUser) => {
    if (!participant) return;
    onRestoreParticipant([participant.attributes.email]);
  };

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <div className={css.title}>Danh sách thành viên đã xoá</div>
        <RenderWhen condition={!!removedParticipantData}>
          <div className={css.count}>{removedParticipantData.length}</div>
        </RenderWhen>
      </div>
      <div className={css.removedParticipantContainer}>
        {removedParticipantData.map((p: TObject) => {
          const participantGetter = User(p as TUser);
          const participantId = participantGetter.getId();
          const { firstName, lastName, displayName } =
            participantGetter.getProfile();
          const { email } = participantGetter.getAttributes();

          return (
            <ParticipantCard
              key={participantId}
              name={buildFullName(firstName, lastName, {
                compareToGetLongerWith: displayName,
              })}
              email={email}
              participant={p as TUser}
              hasRestoreIcon
              onRestoreParticipant={handleRestoreParticipant}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RemovedParticipantList;
