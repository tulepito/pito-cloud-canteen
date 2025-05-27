import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { prepareOrderDeadline } from '@helpers/order/prepareDataHelper';
import { isOrderOverDeadline } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import CoverBox from '@pages/participant/components/CoverBox/CoverBox';
import OrderCalendarView from '@pages/participant/components/OrderCalendarView/OrderCalendarView';
import { participantOrderManagementThunks } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import missingPickingOrderCover from '@src/assets/missingPickingCover.png';
import pickingOrderCover from '@src/assets/pickingOrderCover.png';
import { participantPaths } from '@src/paths';
import { Listing, User } from '@src/utils/data';
import { diffDays, formatTimestamp } from '@src/utils/dates';
import { EOrderStates } from '@src/utils/enums';
import type { TListing, TUser } from '@utils/types';

import SectionOrderHeader from '../../components/SectionOrderHeader/SectionOrderHeader';
import { VIEWS } from '../../helpers/constants';

import css from './ParticipantOrderManagement.module.scss';

const ParticipantOrderManagement = () => {
  const router = useRouter();
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { query } = router;
  const { orderId } = query;
  const isOwnerControl = useBoolean();

  // State
  const [currentView, setCurrentView] = useState(VIEWS.CALENDAR);
  const currentUser = useAppSelector(currentUserSelector);
  const company = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.company,
    shallowEqual,
  );
  const order = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.order,
    shallowEqual,
  );
  const plans = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.plans,
    shallowEqual,
  );
  const pickedFoods = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.pickedFoods,
    shallowEqual,
  );
  const restaurants = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.restaurants,
    shallowEqual,
  );
  const subOrderTxs = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.subOrderTxs,
    shallowEqual,
  );
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantOrderManagementPage.loadDataInProgress,
  );

  const shouldShowFirstTimeOrderModal = useAppSelector(
    (state) =>
      state.ParticipantOrderManagementPage.shouldShowFirstTimeOrderModal,
  );

  const companyUser = User(company as TUser);
  const orderListing = Listing(order as TListing);
  const { orderName } = orderListing.getPublicData();
  const {
    selectedGroups = [],
    deadlineDate,
    deadlineHour,
    orderState,
    startDate,
  } = orderListing.getMetadata();
  const { displayName: bookerName } = companyUser.getProfile();
  const { companyName } = companyUser.getPublicData();
  const { groups = [] } = companyUser.getMetadata();
  const isOrderCanceled = orderState === EOrderStates.canceled;
  const isOrderExpiredStart = orderState === EOrderStates.expiredStart;
  const today = new Date().getTime();
  const isOrderExpiredPickingDate =
    Number(diffDays(deadlineDate, today, 'day').days) < 0;
  const isTodayAfterStartDate =
    Number(diffDays(startDate, today, 'day').days) < 0;
  const selectedGroupNames =
    selectedGroups.includes('allMembers') || !selectedGroups.length
      ? [intl.formatMessage({ id: 'tat-ca-thanh-vien' })]
      : selectedGroups.map((groupId: string) => {
          return groups.find((group: any) => group.id === groupId)?.name;
        });
  const orderDeadline = prepareOrderDeadline(deadlineDate, deadlineHour);

  const rowInformation = [
    {
      label: `${intl.formatMessage({
        id: 'OrderSettingModal.field.company',
      })}:`,
      value: companyName,
    },
    {
      label: `${intl.formatMessage({ id: 'GroupMemberDetailPage.group' })}:`,
      value: selectedGroupNames.join(', '),
    },
    {
      label: `${intl.formatMessage({
        id: 'SidebarContent.nav.settings.expiredTime',
      })}:`,
      value: formatTimestamp(orderDeadline, 'dd/MM/yyyy, HH:mm'),
    },
    {
      label: `${intl.formatMessage({
        id: 'Tracking.OrderInfo.contactorName',
      })}:`,
      value: bookerName,
    },
  ];

  const shouldShowMissingPickingOrderModal =
    !isEmpty(order) &&
    isOrderOverDeadline(order as TListing) &&
    !isOrderCanceled;

  const pickingOrderModalControl = useBoolean(
    !shouldShowMissingPickingOrderModal,
  );
  const missingPickingOrderModalControl = useBoolean(
    shouldShowMissingPickingOrderModal,
  );
  useEffect(() => {
    if (orderId) {
      dispatch(participantOrderManagementThunks.loadData(orderId as string));
    }
  }, [dispatch, orderId]);

  const loadingInProgress = loadDataInProgress;
  const tabOptions = [
    {
      id: 'company',
      label: null,
      children: '',
      childrenFn: (props: any) => <OrderCalendarView {...props} />,
      childrenProps: {
        company,
        order,
        plans,
        pickedFoods,
        restaurants,
        currentUser,
        loadDataInProgress,
        subOrderTxs,
      },
    },
  ];

  const goToHomePage = () => {
    router.push(participantPaths.OrderList);
  };

  const updateHideFirstTimeOrderModal = async () => {
    const { meta } = await dispatch(
      participantOrderManagementThunks.updateFirstTimeViewOrder(
        orderId as string,
      ),
    );
    const from =
      router.pathname === participantPaths.OrderList
        ? 'orderList'
        : 'orderDetail';

    const plan = Listing(plans[0]);
    const planId = plan.getId();
    const { orderDetail } = plan.getMetadata();
    const [timestamp] = Object.keys(orderDetail);
    const routerQuery = {
      pathname: participantPaths.PlanDetail,
      query: { orderDay: Number(timestamp), planId, from },
    };

    if (meta.requestStatus === 'fulfilled') {
      pickingOrderModalControl.setFalse();
    }

    router.push(routerQuery);
  };

  const showModalMaybe =
    (pickingOrderModalControl.value || missingPickingOrderModalControl.value) &&
    !loadDataInProgress &&
    !isOrderCanceled &&
    !isOrderExpiredStart &&
    !isTodayAfterStartDate &&
    !isOrderExpiredPickingDate &&
    shouldShowFirstTimeOrderModal;

  return (
    <ParticipantLayout className={showModalMaybe ? css.container : ''}>
      <RenderWhen condition={showModalMaybe}>
        <RenderWhen condition={pickingOrderModalControl.value}>
          <CoverBox
            coverSrc={pickingOrderCover}
            contentInProgress={loadDataInProgress}
            modalTitle={intl.formatMessage({ id: 'PickingOrderModal.title' })}
            modalDescription={intl.formatMessage(
              { id: 'PickingOrderModal.description' },
              {
                span: (msg: ReactNode) => (
                  <span className={css.boldText}>{msg}</span>
                ),
                orderName,
              },
            )}
            rowInformation={rowInformation}
            buttonWrapper={
              <Button
                className={css.btn}
                disabled={loadDataInProgress}
                onClick={updateHideFirstTimeOrderModal}>
                {intl.formatMessage({
                  id: 'FieldAvailability.startTimePlaceholder',
                })}
              </Button>
            }
          />
        </RenderWhen>
        <RenderWhen condition={missingPickingOrderModalControl.value}>
          <CoverBox
            coverSrc={missingPickingOrderCover}
            contentInProgress={loadDataInProgress}
            modalTitle={intl.formatMessage({ id: 'MissingOrderModal.title' })}
            modalDescription={intl.formatMessage({
              id: 'MissingOrderModal.description',
            })}
            rowInformation={rowInformation}
            buttonWrapper={
              <Button
                className={css.btn}
                onClick={goToHomePage}
                disabled={loadDataInProgress}>
                {intl.formatMessage({
                  id: 'EmailVerification.toHomePageLinkText',
                })}
              </Button>
            }
          />
        </RenderWhen>

        <RenderWhen.False>
          <>
            <SectionOrderHeader
              currentView={currentView}
              setViewFunction={setCurrentView}
              showToggle={isOwnerControl.value}
            />
            {loadDataInProgress ? (
              <>
                <CalendarDashboard
                  inProgress={loadDataInProgress}
                  components={{ toolbar: () => <></> }}
                />
              </>
            ) : (
              <Tabs
                items={tabOptions}
                headerClassName={classNames(css.tabHeader, '!hidden')}
              />
            )}
            <LoadingModal isOpen={loadingInProgress} />
          </>
        </RenderWhen.False>
      </RenderWhen>
    </ParticipantLayout>
  );
};

export default ParticipantOrderManagement;
