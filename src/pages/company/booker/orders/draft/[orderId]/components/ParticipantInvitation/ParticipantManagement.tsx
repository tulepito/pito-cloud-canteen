import { toast } from 'react-toastify';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  filterHasAccountUserIds,
  filterHasAccountUsers,
  useAddMemberEmail,
} from '@pages/company/[companyId]/members/hooks/useAddMemberEmail';
import { Listing } from '@src/utils/data';
import { successToastOptions } from '@src/utils/toastify';
import type { TListing, TObject } from '@src/utils/types';

import { BookerDraftOrderPageThunks } from '../../BookerDraftOrderPage.slice';

import type { TAddParticipantFormValues } from './AddParticipantForm';
import AddParticipantForm from './AddParticipantForm';
import ImportParticipantFromFile from './ImportParticipantFromFile';
import ParticipantList from './ParticipantList';

import css from './ParticipantManagement.module.scss';

type TParticipantManagementProps = {};

const ParticipantManagement: React.FC<TParticipantManagementProps> = () => {
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => state.Order.order);
  const participantData = useAppSelector(
    (state) => state.BookerDraftOrderPage.participantData,
  );
  const {
    onAddMembersSubmitInQuizFlow: handleAddMemberToCompany,
    checkEmailList,
  } = useAddMemberEmail();

  const orderGetter = Listing(order as TListing);
  const orderId = orderGetter.getId();

  const isParticipantListEmpty = isEmpty(participantData);
  const restrictEmailList = participantData.map((p) => p.attributes.email);
  const restrictParticipantIds = participantData.map((p) => p.id.uuid);

  const handleInviteMemberViaEmailList = async (emailList: string[]) => {
    const needInviteEmailList = difference(emailList, restrictEmailList);

    if (!isEmpty(needInviteEmailList)) {
      const newLoadedResult = await checkEmailList(needInviteEmailList);
      const newUserIds = filterHasAccountUserIds(newLoadedResult as TObject[]);
      const newUsers = filterHasAccountUsers(newLoadedResult as TObject[]);

      handleAddMemberToCompany(newLoadedResult as TObject[]);

      if (!isEmpty(newUserIds)) {
        await dispatch(
          BookerDraftOrderPageThunks.addOrderParticipants({
            orderId,
            participants: restrictParticipantIds,
            newUserIds,
            newUsers,
          }),
        );

        const message = (
          <span>
            Đã thêm{' '}
            {newUserIds.length > 1 ? <b>{newUserIds.length} email</b> : 'email'}{' '}
            vào danh sách
          </span>
        );

        toast(message, successToastOptions);
      }
    }
  };

  const handleSubmitAddParticipant = async ({
    emails,
  }: TAddParticipantFormValues) => {
    const parseEmailList = uniq(emails.trim().replace(/\s+/g, ' ').split(' '));

    await handleInviteMemberViaEmailList(parseEmailList);
  };

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <div className={css.title}>Danh sách thành viên hiện tại</div>
        <RenderWhen condition={!isParticipantListEmpty}>
          <div className={css.count}>{participantData.length}</div>
        </RenderWhen>
      </div>

      <AddParticipantForm
        onSubmit={handleSubmitAddParticipant}
        restrictEmailList={restrictEmailList}
      />
      <ImportParticipantFromFile
        handleInviteMember={handleInviteMemberViaEmailList}
      />
      <ParticipantList />
    </div>
  );
};

export default ParticipantManagement;
