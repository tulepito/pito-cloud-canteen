import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import invitationCover from '@src/assets/invitationCover.png';
import { participantPaths } from '@src/paths';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import CoverBox from '../components/CoverBox/CoverBox';

import css from './CompanyInvitation.module.scss';

const CompanyInvitationPage = () => {
  const router = useRouter();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { isReady } = router;
  const { companyId = '' } = router.query;
  const currentUser = useAppSelector(currentUserSelector);
  const company = useAppSelector(
    (state) => state.companyInvitation.company,
    shallowEqual,
  );
  const fetchCompanyInfoInProgress = useAppSelector(
    (state) => state.companyInvitation.fetchCompanyInfoInProgress,
  );
  const companyUser = User(company as TUser);
  const user = User(currentUser as TUser);
  const { companyName } = companyUser.getPublicData();

  const { lastName: userLastName, firstName: userFistName } = user.getProfile();
  const { displayName: bookerName } = companyUser.getProfile();
  const { responseToInvitationInProgress, responseToInvitationResult } =
    useAppSelector((state) => state.companyInvitation);

  const invalidInvitation = responseToInvitationResult === 'invalidInvitaion';

  const isLoading =
    responseToInvitationInProgress ||
    fetchCompanyInfoInProgress ||
    invalidInvitation;

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
    if (invalidInvitation) {
      router.push(participantPaths.OrderList);
    }
  }, [invalidInvitation, router]);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        companyInvitationThunks.fetchCompanyInfo(companyId as string),
      );
      await dispatch(
        companyInvitationThunks.responseToInvitation({
          companyId: companyId as string,
          response: 'accept',
        }),
      );
    };
    if (isReady) {
      if (currentUser) {
        fetchData();
      }
    }
  }, [companyId, currentUser, dispatch, isReady]);

  const goToHomePage = async () => {
    const { meta } = await dispatch(userThunks.fetchCurrentUser());

    if (meta.requestStatus === 'fulfilled') {
      router.push(participantPaths.OrderList);
    }
  };

  return (
    <div className={css.foodBackground}>
      <CoverBox
        coverSrc={invitationCover}
        modalTitle={intl.formatMessage({ id: 'InvitationModal.title' })}
        modalDescription={intl.formatMessage(
          { id: 'InvitationModal.description' },
          {
            span: (msg: ReactNode) => (
              <span className={css.boldText}>{msg}</span>
            ),
            participantName: `${userLastName} ${userFistName}`,
            companyName,
          },
        )}
        rowInformation={rowInformation}
        buttonWrapper={
          <>
            <Button className={css.btn} onClick={goToHomePage}>
              Bắt đầu
            </Button>
          </>
        }
      />
      <LoadingModal isOpen={isLoading} />
    </div>
  );
};

export default CompanyInvitationPage;
