import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import RedirectLink from '@components/RedirectLink/RedirectLink';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';
import { UserInviteResponse } from '@src/types/UserPermission';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import InvitationCard from './components/InvitationCard/InvitationCard';
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
  const {
    responseToInvitationInProgress,
    checkInvitationResult,
    responseToInvitationResult,
  } = useAppSelector((state) => state.companyInvitation);

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
        <InvitationCard
          companyName={User(company as TUser).getPublicData().companyName}
          onAccept={onResponseInvitation(UserInviteResponse.ACCEPT)}
          onDecline={onResponseInvitation(UserInviteResponse.DECLINE)}
          responseToInvitationInProgress={responseToInvitationInProgress}
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
