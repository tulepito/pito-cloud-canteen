import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import type { AxiosResponse } from 'axios';
import { useRouter } from 'next/router';

import { responseToInvitationApi } from '@apis/companyInvitationApi';
import Button from '@components/Button/Button';
import FullScreenPageLoading from '@components/FullScreenPageLoading/FullScreenPageLoading';
import DecoratorLayout from '@components/Layout/DecoratorLayout/DecoratorLayout';
import { isUserABookerOrOwner } from '@helpers/user';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import type { ResponseApiResponse } from '@pages/api/invitation/response.api';
import { BookerSelectRestaurantThunks } from '@pages/company/booker/orders/draft/[orderId]/restaurants/BookerSelectRestaurant.slice';
import CoverBox from '@pages/participant/components/CoverBox/CoverBox';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import invitationCover from '@src/assets/invitationCover.png';
import { participantPaths } from '@src/paths';
import type { OrderListing, PlanListing } from '@src/types';
import { User } from '@src/utils/data';
import { EUserRole } from '@src/utils/enums';
import type { TUser } from '@src/utils/types';

function EmptyView({
  title,
  description,
  buttonComponent,
}: {
  title: string;
  description: string | ReactNode;
  buttonComponent: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
      }}>
      <div
        style={{
          textAlign: 'center',
        }}>
        <h2
          style={{
            margin: 0,
          }}>
          {title}
        </h2>

        {typeof description === 'string' && (
          <p
            style={{
              margin: 0,
              color: '#6B6B6B',
            }}>
            {description}
          </p>
        )}

        {typeof description !== 'string' && description}

        <div
          style={{
            borderBottom: '1px solid #E0E0E0',
            width: '100%',
            margin: '16px 0',
          }}></div>
      </div>
      {buttonComponent}
    </div>
  );
}

const InvitationPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { companyId, orderId } = router.query;
  const currentRole = useAppSelector((state) => state.user.currentRole);
  const planRef = useRef<PlanListing | null>(null);
  const waitChangeRoleRef = useRef<boolean>(false);
  const [isCheckingInvitation, setIsCheckingInvitation] = useState(false);
  const [isLoadingCompanyData, setIsLoadingCompanyData] = useState(false);
  const [isRoutingToPlan, setIsRoutingToPlan] = useState(false);
  const intl = useIntl();

  const currentUser = useAppSelector(currentUserSelector);

  const { responseToInvitationResult } = useAppSelector(
    (state) => state.companyInvitation,
  );
  const user = User(currentUser as TUser);
  const { lastName: userLastName, firstName: userFistName } = user.getProfile();
  const { onOpenRoleSelectModal } = useRoleSelectModalController();
  const company = useAppSelector(
    (state) => state.companyInvitation.company,
    shallowEqual,
  );
  const companyUser = User(company as TUser);
  const { companyName } = companyUser.getPublicData();

  const [error, setError] = useState('');

  const invalidInvitation = responseToInvitationResult === 'invalidInvitaion';

  const handleLogoutFn = useLogout({
    from: router.asPath,
  });

  const handleLogout = async () => {
    await handleLogoutFn();
  };

  const _isUserABooker = currentRole
    ? currentRole === EUserRole.booker
    : isUserABookerOrOwner(currentUser);

  useEffect(() => {
    if (invalidInvitation) {
      router.push(participantPaths.OrderList);
    }
  }, [invalidInvitation, router]);

  const routeToPlan = useCallback(() => {
    if (!planRef.current?.id?.uuid) return;

    setIsRoutingToPlan(true);
    router.push({
      pathname: participantPaths.order['[orderId]'].index(String(orderId)),
    });
  }, [orderId, router]);

  useEffect(() => {
    if (waitChangeRoleRef.current && currentRole === EUserRole.participant) {
      routeToPlan();
    }
  }, [currentRole, routeToPlan, router]);

  const acceptInvitaiton = useCallback(async () => {
    try {
      if (typeof companyId !== 'string') return;

      await responseToInvitationApi({
        companyId,
        response: 'accept',
        source: 'invitation-link',
        type: 'response',
      });

      routeToPlan();
    } catch (_error: any) {
      setError(_error?.response?.data?.message || String(_error));
    }
  }, [companyId, routeToPlan]);

  const checkInvitation = useCallback(async () => {
    try {
      if (typeof companyId !== 'string') return;

      setIsCheckingInvitation(true);
      const response: AxiosResponse<ResponseApiResponse> =
        await responseToInvitationApi({
          companyId,
          response: undefined,
          source: 'invitation-link',
          type: 'check',
        });

      if (response.data.message === 'Người dùng đã tham gia công ty này') {
        if (response.data.nextAction === 'redirect') routeToPlan();
        else {
          waitChangeRoleRef.current = true;
        }
      }
    } catch (_error: any) {
      setError(_error?.response?.data?.message || String(_error));
    } finally {
      setIsCheckingInvitation(false);
    }
  }, [companyId, routeToPlan]);

  useEffect(() => {
    checkInvitation();
  }, [checkInvitation]);

  useEffect(() => {
    if (orderId) {
      (async () => {
        const orderResponse = await dispatch(
          BookerSelectRestaurantThunks.fetchOrder(orderId as string),
        );

        const order = orderResponse.payload as OrderListing;

        if (!order.attributes?.metadata?.plans?.[0]) return;

        const planResponse = await dispatch(
          BookerSelectRestaurantThunks.fetchPlanDetail(
            order.attributes?.metadata?.plans[0],
          ),
        );

        const plan = planResponse.payload as PlanListing;

        planRef.current = plan;
      })();
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof companyId !== 'string') return;

      setIsLoadingCompanyData(true);
      try {
        await dispatch(
          companyInvitationThunks.fetchCompanyInfo(companyId),
        ).unwrap();
      } catch (catchError) {
        setError(String(catchError));
      } finally {
        setIsLoadingCompanyData(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [companyId, currentUser, dispatch]);

  return (
    <DecoratorLayout>
      {isRoutingToPlan || isLoadingCompanyData || isCheckingInvitation ? (
        <FullScreenPageLoading fullScreen={false} />
      ) : (
        <div
          style={{
            padding: '16px',
            maxWidth: '600px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {currentUser?.attributes?.profile?.metadata?.isPartner ? (
            <EmptyView
              title="Bạn đang đăng nhập với tài khoản đối tác"
              description="Bạn đang truy cập đường dẫn chọn món dành cho `Người tham gia`. Vui lòng đăng nhập bằng tài khoản `Người tham gia` để tham gia đơn"
              buttonComponent={
                <div
                  style={{
                    gap: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Button variant="secondary" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </div>
              }
            />
          ) : error ? (
            <EmptyView
              title="Không thể tham gia đơn"
              description={
                <div
                  style={{
                    marginTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                  <p style={{ textAlign: 'center', margin: 0 }}>{error}</p>
                  <p style={{ textAlign: 'center', margin: 0 }}>
                    Hãy thử tham gia đơn hàng này bằng tài khoản khác
                  </p>
                </div>
              }
              buttonComponent={
                <div
                  style={{
                    gap: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Button variant="secondary" onClick={handleLogout}>
                    Đăng nhập bằng tài khoản khác
                  </Button>
                </div>
              }
            />
          ) : _isUserABooker ? (
            <EmptyView
              title="Vai trò không hợp lệ"
              description="Bạn đang đăng nhập bằng tài khoản Booker hoặc Owner. Vui lòng đổi vai trò `Người tham gia` để tham gia đơn"
              buttonComponent={
                <div
                  style={{
                    gap: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Button variant="secondary" onClick={handleLogout}>
                    Đăng xuất
                  </Button>

                  <Button variant="primary" onClick={onOpenRoleSelectModal}>
                    Đổi vai trò
                  </Button>
                </div>
              }
            />
          ) : (
            <CoverBox
              coverSrc={invitationCover}
              modalTitle={intl.formatMessage({ id: 'InvitationModal.title' })}
              modalDescription={intl.formatMessage(
                { id: 'InvitationModal.description' },
                {
                  span: (msg: ReactNode) => <span>{msg}</span>,
                  participantName: (
                    <b>
                      {userLastName} {userFistName}
                    </b>
                  ),
                  companyName: <b>{companyName}</b>,
                },
              )}
              buttonWrapper={
                <Button
                  style={{ width: '100%' }}
                  variant="primary"
                  disabled={isLoadingCompanyData}
                  onClick={acceptInvitaiton}>
                  Bắt đầu
                </Button>
              }
            />
          )}
        </div>
      )}
    </DecoratorLayout>
  );
};

export default InvitationPage;
