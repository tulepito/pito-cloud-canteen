import RedirectLink from '@components/RedirectLink/RedirectLink';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { generalPaths } from '@src/paths';
import { USER } from '@utils/data';
import type { TUser } from '@utils/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

import css from './CompanyInvitation.module.scss';
import InvitationCard from './components/InvitationCard/InvitationCard';
import InvitationNotiModal from './components/InvitationNotiModal/InvitationNotiModal';

const CompanyInvitationPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isReady } = router;
  const { companyId = '' } = router.query;
  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );
  const company = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );
  const responseToInvitationInProgress = useAppSelector(
    (state) => state.companyInvitation.responseToInvitationInProgress,
  );
  const checkInvitationResult = useAppSelector(
    (state) => state.companyInvitation.checkInvitationResult,
  );
  const responseToInvitationResult = useAppSelector(
    (state) => state.companyInvitation.responseToInvitationResult,
  );
  useEffect(() => {
    const fetchData = async () => {
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(BookerManageCompany.companyInfo());
      dispatch(companyInvitationThunks.checkInvitation(companyId as string));
    };
    if (isReady) {
      if (currentUser) {
        fetchData();
      }
    }
  }, [companyId, currentUser, dispatch, isReady]);

  useEffect(() => {}, [responseToInvitationResult]);

  const onResponseInvitation = (response: 'accept' | 'decline') => () => {
    dispatch(
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

  if (checkInvitationResult === 'showInvitation') {
    return (
      <div className={css.foodBackground}>
        <InvitationCard
          companyName={USER(company as TUser).getPublicData().companyName}
          onAccept={onResponseInvitation('accept')}
          onDecline={onResponseInvitation('decline')}
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
