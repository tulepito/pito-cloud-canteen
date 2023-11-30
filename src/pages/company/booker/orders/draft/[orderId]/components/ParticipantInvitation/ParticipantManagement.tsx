import { toast } from 'react-toastify';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import {
  filterHasAccountUserIds,
  filterHasAccountUsers,
  filterNoAccountUserEmail,
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
  const { isMobileLayout } = useViewport();
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
  const { nonAccountEmails = [] } = orderGetter.getMetadata();

  const isParticipantListEmpty = isEmpty(participantData);
  const restrictEmailList = participantData.map((p) => p.attributes.email);
  const restrictParticipantIds = participantData.map((p) => p.id.uuid);

  const handleInviteMemberViaEmailList = async (emailList: string[]) => {
    const needInviteEmailList = difference(
      emailList,
      restrictEmailList.concat(nonAccountEmails),
    );

    if (!isEmpty(needInviteEmailList)) {
      const newLoadedResult = (await checkEmailList(
        needInviteEmailList,
      )) as TObject[];
      const newNonAccountEmails = filterNoAccountUserEmail(newLoadedResult);
      const newUserIds = filterHasAccountUserIds(newLoadedResult);
      const newUsers = filterHasAccountUsers(newLoadedResult);

      handleAddMemberToCompany(newLoadedResult as TObject[]);

      const needHandleItems = newUserIds.concat(newNonAccountEmails);

      if (!isEmpty(needHandleItems)) {
        const nonAccountEmailsParamMaybe = isEmpty(newNonAccountEmails)
          ? {}
          : {
              nonAccountEmails: nonAccountEmails.concat(newNonAccountEmails),
            };

        await dispatch(
          BookerDraftOrderPageThunks.addOrderParticipants({
            orderId,
            participants: restrictParticipantIds,
            nonAccountEmails,
            newUserIds,
            newUsers,
            ...nonAccountEmailsParamMaybe,
          }),
        );

        const message = (
          <span>
            Đã thêm{' '}
            {needHandleItems.length > 1 ? (
              <b>{needHandleItems.length} email</b>
            ) : (
              'email'
            )}{' '}
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
        <div className={css.title}>
          {isMobileLayout
            ? 'Danh sách thành viên'
            : 'Danh sách thành viên hiện tại'}
        </div>
        <RenderWhen condition={!isParticipantListEmpty}>
          <div className={css.count}>{participantData.length}</div>
        </RenderWhen>
      </div>

      <AddParticipantForm
        onSubmit={handleSubmitAddParticipant}
        restrictEmailList={restrictEmailList}
      />
      <RenderWhen condition={isMobileLayout}>
        <RenderWhen.False>
          <ImportParticipantFromFile
            handleInviteMember={handleInviteMemberViaEmailList}
          />
        </RenderWhen.False>
      </RenderWhen>
      <ParticipantList />
    </div>
  );
};

export default ParticipantManagement;
