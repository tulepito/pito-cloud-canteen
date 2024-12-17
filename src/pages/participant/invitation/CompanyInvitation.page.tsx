import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import FullScreenPageLoading from '@components/FullScreenPageLoading/FullScreenPageLoading';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import invitationCover from '@src/assets/invitationCover.png';
import { enGeneralPaths, participantPaths } from '@src/paths';
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
  const companyUser = User(company as TUser);
  const user = User(currentUser as TUser);
  const { companyName } = companyUser.getPublicData();

  const { lastName: userLastName, firstName: userFistName } = user.getProfile();
  const { displayName: bookerName } = companyUser.getProfile();
  const { responseToInvitationResult } = useAppSelector(
    (state) => state.companyInvitation,
  );

  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const invalidInvitation = responseToInvitationResult === 'invalidInvitaion';

  const handleLogoutFn = useLogout();

  const handleLogout = async () => {
    await handleLogoutFn();
    router.push(enGeneralPaths.Auth);
  };

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
      setIsLoading(true);
      try {
        await dispatch(
          companyInvitationThunks.fetchCompanyInfo(companyId as string),
        ).unwrap();
      } catch (catchError) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    if (isReady) {
      if (currentUser) {
        fetchData();
      }
    }
  }, [companyId, currentUser, dispatch, isReady]);

  const goToHomePage = () => {
    router.push(participantPaths.OrderList);
  };

  const acceptInvitaiton = async () => {
    setIsLoading(true);
    try {
      await dispatch(
        companyInvitationThunks.responseToInvitation({
          companyId: companyId as string,
          response: 'accept',
          type: 'response',
        }),
      ).unwrap();

      await dispatch(userThunks.fetchCurrentUser()).unwrap();
      goToHomePage();
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={css.errorPage}>
        <h2>Không thể tham gia</h2>
        <p>
          Xin lỗi, bạn không thể tham gia đơn này. Hãy đăng xuất và quay lại
          sau.
        </p>
        <Button onClick={handleLogout}>Đăng xuất</Button>
      </div>
    );
  }

  return (
    <div className={css.foodBackground}>
      {isLoading ? (
        <FullScreenPageLoading />
      ) : (
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
              <Button
                disabled={isLoading}
                className={css.btn}
                onClick={acceptInvitaiton}>
                Bắt đầu
              </Button>
            </>
          }
        />
      )}
    </div>
  );
};

export default CompanyInvitationPage;
