import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { responseToInvitationApi } from '@apis/companyInvitationApi';
import Button from '@components/Button/Button';
import FullScreenPageLoading from '@components/FullScreenPageLoading/FullScreenPageLoading';
import DecoratorLayout from '@components/Layout/DecoratorLayout/DecoratorLayout';
import { isUserABookerOrOwner } from '@helpers/user';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import { BookerSelectRestaurantThunks } from '@pages/company/booker/orders/draft/[orderId]/restaurants/BookerSelectRestaurant.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import type { OrderListing, PlanListing } from '@src/types';
import { ECompanyPermission, EUserRole } from '@src/utils/enums';

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
  const { companyId = '', orderId } = router.query;
  const currentRole = useAppSelector((state) => state.user.currentRole);
  const planRef = useRef<PlanListing | null>(null);

  const currentUser = useAppSelector(currentUserSelector);

  const { responseToInvitationResult } = useAppSelector(
    (state) => state.companyInvitation,
  );
  const { onOpenRoleSelectModal } = useRoleSelectModalController();

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

    router.push({
      pathname: participantPaths.order['[orderId]'].index(String(orderId)),
    });
  }, [router]);

  useEffect(() => {
    if (currentRole === EUserRole.participant) {
      routeToPlan();
    }
  }, [currentRole, router]);

  const acceptInvitaiton = useCallback(async () => {
    try {
      const response = await responseToInvitationApi({
        companyId: companyId as string,
        response: 'accept',
        source: 'invitation-link',
      });

      if (
        response.data.userType === ECompanyPermission.owner ||
        response.data.userType === ECompanyPermission.booker
      )
        return;

      routeToPlan();
    } catch (_error: any) {
      setError(_error?.response?.data?.message || String(_error));
    }
  }, [companyId, router]);

  useEffect(() => {
    acceptInvitaiton();
  }, [acceptInvitaiton]);

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
  }, [orderId]);

  return (
    <DecoratorLayout>
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
          <FullScreenPageLoading fullScreen={false} />
        )}
      </div>
    </DecoratorLayout>
  );
};

export default InvitationPage;
