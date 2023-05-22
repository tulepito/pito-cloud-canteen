import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import CoverModal from '@components/CoverModal/CoverModal';
import RedirectLink from '@components/RedirectLink/RedirectLink';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import invitationCover from '@src/assets/invitationCover.png';
import { generalPaths } from '@src/paths';
import { UserInviteResponse } from '@src/types/UserPermission';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import InvitationNotiModal from './components/InvitationNotiModal/InvitationNotiModal';

import css from './CompanyInvitation.module.scss';

const CompanyInvitationPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isReady } = router;
  const { companyId = '' } = router.query;
  const currentUser = useAppSelector(currentUserSelector);
  const company = useAppSelector(
    (state) => state.companyInvitation.company,
    shallowEqual,
  );
  const [actionLoading, setActionLoading] = useState<string>('');
  const companyUser = User(company as TUser);
  const { companyName } = companyUser.getPublicData();
  const { displayName: bookerName } = companyUser.getProfile();
  const {
    responseToInvitationInProgress,
    checkInvitationResult,
    responseToInvitationResult,
  } = useAppSelector((state) => state.companyInvitation);
  const invitationModalControl = useBoolean(true);

  const rowInformation = [
    {
      label: 'Công ty:',
      value: companyName,
    },
    {
      label: 'Người tạo nhóm:',
      value: bookerName,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        companyInvitationThunks.fetchCompanyInfo(companyId as string),
      );
      dispatch(companyInvitationThunks.checkInvitation(companyId as string));
    };
    if (isReady) {
      if (currentUser) {
        fetchData();
      }
    }
  }, [companyId, currentUser, dispatch, isReady]);

  const onResponseInvitation = (response: UserInviteResponse) => async () => {
    await dispatch(
      companyInvitationThunks.responseToInvitation({
        response,
        companyId: companyId as string,
      }),
    );
  };

  const handleAccept = async () => {
    setActionLoading('accept');
    await onResponseInvitation(UserInviteResponse.ACCEPT)();
    setActionLoading('');
  };
  const handleDecline = async () => {
    setActionLoading('decline');
    await onResponseInvitation(UserInviteResponse.DECLINE)();
    setActionLoading('');
  };

  const goToHomePage = () => {
    router.push(generalPaths.Home);
  };

  if (
    !responseToInvitationResult &&
    checkInvitationResult === 'invitationExpired'
  )
    return <InvitationNotiModal status="expire" goToHomePage={goToHomePage} />;

  if (
    !responseToInvitationResult &&
    checkInvitationResult === 'invalidInvitaion'
  ) {
    return <InvitationNotiModal status="invalid" goToHomePage={goToHomePage} />;
  }

  if (
    !responseToInvitationResult &&
    checkInvitationResult === 'invitationDeclinedBefore'
  ) {
    return <InvitationNotiModal status="decline" goToHomePage={goToHomePage} />;
  }

  if (
    !responseToInvitationResult &&
    checkInvitationResult === 'redirectToCalendar'
  ) {
    return <RedirectLink pathname={generalPaths.Home} />;
  }

  if (
    !responseToInvitationResult &&
    checkInvitationResult === 'showInvitation'
  ) {
    return (
      <div className={css.foodBackground}>
        <CoverModal
          id="InvitationModal"
          isOpen={invitationModalControl.value}
          onClose={invitationModalControl.setFalse}
          coverSrc={invitationCover}
          modalTitle="Bạn nhận được lời mời tham gia PITO Cloud Canteen"
          modalDescription={
            <span>
              {bookerName} <strong>công ty {companyName}</strong> mời bạn tham
              gia PITO Cloud Canteen - Đặt bữa ăn hàng ngày. Chọn tham gia để
              bắt đầu chọn món cho tuần ăn của bạn.
            </span>
          }
          rowInformation={rowInformation}
          buttonWrapper={
            <>
              <Button
                variant="secondary"
                inProgress={
                  responseToInvitationInProgress &&
                  actionLoading === UserInviteResponse.DECLINE
                }
                className={css.btn}
                onClick={handleDecline}>
                Từ chối
              </Button>
              <Button
                inProgress={
                  responseToInvitationInProgress &&
                  actionLoading === UserInviteResponse.ACCEPT
                }
                className={css.btn}
                onClick={handleAccept}>
                Tham gia
              </Button>
            </>
          }
        />
      </div>
    );
  }

  if (responseToInvitationResult === 'userDecline') {
    return <InvitationNotiModal status="decline" goToHomePage={goToHomePage} />;
  }

  if (responseToInvitationResult === 'userAccept') {
    return <RedirectLink pathname={generalPaths.Home} />;
  }

  return <div className={css.foodBackground}></div>;
};

export default CompanyInvitationPage;
