/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import isEmpty from 'lodash/isEmpty';
import Image from 'next/image';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import {
  findSuitableStartDate,
  getParticipantPickingLink,
  isEnableSubmitPublishOrder,
} from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useRestaurantDetailModal from '@hooks/useRestaurantDetailModal';
import { OrderListThunks } from '@pages/participant/orders/OrderList.slice';
import { addWorkspaceCompanyId } from '@redux/slices/company.slice';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import Gleap from '@src/utils/gleap';
import { successToastOptions } from '@src/utils/toastify';
import { Listing, User } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderType,
} from '@utils/enums';
import type { TListing, TUser } from '@utils/types';

import emptyResultImg from '../../../../../../assets/emptyResult.png';
import Layout from '../../components/Layout/Layout';
import LayoutMain from '../../components/Layout/LayoutMain';
import LayoutSidebar from '../../components/Layout/LayoutSidebar';

import ParticipantInvitation from './components/ParticipantInvitation/ParticipantInvitation';
import SidebarContent from './components/SidebarContent/SidebarContent';
import WalkThroughTourProvider from './components/WalkThroughTour/WalkThroughTour';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';
import { useGetPlanDetails, useLoadData } from './hooks/loadData';
import {
  BookerSelectRestaurantActions,
  BookerSelectRestaurantThunks,
} from './restaurants/BookerSelectRestaurant.slice';
import ResultDetailModal from './restaurants/components/ResultDetailModal/ResultDetailModal';
import {
  useGetCalendarComponentProps,
  useGetCalendarExtraResources,
} from './restaurants/hooks/calendar';
import { useGetBoundaryDates } from './restaurants/hooks/dateTime';
import { useGetOrder } from './restaurants/hooks/orderData';
import { BookerDraftOrderPageThunks } from './BookerDraftOrderPage.slice';

import css from './BookerDraftOrder.module.scss';

const ENABLE_TO_ACCESS_PAGE_ORDER_STATES = [
  EOrderDraftStates.pendingApproval,
  EBookerOrderDraftStates.bookerDraft,
];

export enum EBookerDraftOrderViewMode {
  setup = 'setup',
  memberInvitation = 'memberInvitation',
}

function BookerDraftOrderPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [collapse, setCollapse] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(0);
  const [currentViewMode, setCurrViewMode] =
    useState<EBookerDraftOrderViewMode>(EBookerDraftOrderViewMode.setup);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);
  // * Walkthrough
  const currentUserGetter = User(currentUser);
  const currentUserId = currentUserGetter.getId();
  const { walkthroughEnable = true } = currentUserGetter.getMetadata();
  const welcomeModalControl = useBoolean(walkthroughEnable);

  const { order, companyAccount } = useLoadData({
    orderId: orderId as string,
  });
  useGetOrder({ orderId: orderId as string });

  const fetchOrderParticipantsInProgress = useAppSelector(
    (state) => state.BookerDraftOrderPage.fetchOrderParticipantsInProgress,
  );
  const restaurantFood = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantFood,
    shallowEqual,
  );
  const fetchRestaurantFoodInProgress = useAppSelector(
    (state) => state.BookerSelectRestaurant.fetchRestaurantFoodInProgress,
  );
  const isAllDatesHaveNoRestaurants = useAppSelector(
    (state) => state.Order.isAllDatesHaveNoRestaurants,
  );
  const searchInProgress = useAppSelector(
    (state) => state.BookerSelectRestaurant.searchInProgress,
  );
  const availableOrderDetailCheckList = useAppSelector(
    (state) => state.Order.availableOrderDetailCheckList,
    shallowEqual,
  );
  const selectedDate = useAppSelector(
    (state) => state.Order.selectedCalendarDate,
  );
  const { orderDetail = [] } = useGetPlanDetails();
  const { startDate, endDate } = useGetBoundaryDates(order);
  const calendarExtraResources = useGetCalendarExtraResources({
    order,
    startDate,
    endDate,
  });
  const {
    isRestaurantDetailModalOpen,
    openRestaurantDetailModal,
    closeRestaurantDetailModal,
    menuId,
    restaurants,
  } = useRestaurantDetailModal();

  const isSetupMode = currentViewMode === EBookerDraftOrderViewMode.setup;
  const {
    orderState,
    plans = [],
    orderType = EOrderType.normal,
    startDate: startDateTimestamp,
    endDate: endDateTimestamp,
    packagePerMember = 0,
    participants = [],
    companyId,
    orderDeadline,
  } = Listing(order as TListing).getMetadata();
  const planId = plans.length > 0 ? plans[0] : undefined;
  const isGroupOrder = orderType === EOrderType.group;

  const isFinishOrderDisabled =
    (isGroupOrder && fetchOrderParticipantsInProgress) ||
    !isEnableSubmitPublishOrder(
      order as TListing,
      orderDetail,
      availableOrderDetailCheckList,
    );

  const companyGeoOrigin = useMemo(
    () => ({
      ...User(companyAccount as TUser).getPublicData()?.companyLocation?.origin,
    }),
    [JSON.stringify(companyAccount)],
  );

  const suitableStartDate = useMemo(() => {
    const temp = findSuitableStartDate({
      selectedDate,
      startDate: startDateTimestamp,
      endDate: endDateTimestamp,
      orderDetail,
    });

    return temp instanceof Date ? temp : new Date(temp!);
    // eslint-disable-next-line prettier/prettier
  }, [
    selectedDate,
    startDateTimestamp,
    endDateTimestamp,
    JSON.stringify(orderDetail),
  ]);

  const handlePublishDraftOrder = async () => {
    const { meta } = await dispatch(
      orderAsyncActions.bookerPublishOrder({ orderId, planId }),
    );
    if (meta.requestStatus !== 'rejected') {
      if (!isSetupMode) {
        toast('Đã gửi lời mời đến thành viên', successToastOptions);

        dispatch(
          BookerDraftOrderPageThunks.sendRemindEmailToMembers({
            orderId: orderId as string,
            orderLink: getParticipantPickingLink(orderId as string),
            deadline: formatTimestamp(orderDeadline, 'HH:mm EEE,dd/MM/yyyy'),
            memberIdList: participants,
          }),
        );
      }

      router.push({
        pathname: companyPaths.ManageOrderPicking,
        query: { orderId: orderId as string },
      });
    }
  };

  const handleGoBackFromInvitationView = () => {
    setCurrViewMode(EBookerDraftOrderViewMode.setup);
  };

  const handleFinishOrderClick = async () => {
    if (isGroupOrder) {
      setCurrViewMode(EBookerDraftOrderViewMode.memberInvitation);
    } else {
      await handlePublishDraftOrder();
    }
  };

  const handleCollapse = useCallback(() => {
    setCollapse(!collapse);
  }, [collapse]);

  const handleRemoveMeal = useCallback(
    (id: string) => (resourceId: string) => {
      dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId: id,
          orderDetail: {
            [resourceId]: null,
          },
          updateMode: 'merge',
        }),
      );
    },
    [dispatch, orderId],
  );

  const componentsProps = useGetCalendarComponentProps({
    startDate,
    endDate,
    isFinishOrderDisabled,
    handleFinishOrder: handleFinishOrderClick,
    order,
    shouldHideDayItems: isAllDatesHaveNoRestaurants,
  });

  const onOpenPickFoodModal = async (
    dateTime: any,
    restaurantId: string,
    menuId: string,
  ) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedTimestamp(+dateTime);
    dispatch(
      BookerSelectRestaurantActions.setSelectedRestaurantId(restaurantId),
    );
    const isRestaurantFetched =
      restaurants.findIndex((restaurant) => restaurant.id === restaurantId) !==
      -1;

    if (!isRestaurantFetched) {
      await dispatch(
        BookerSelectRestaurantThunks.fetchRestaurant(restaurantId),
      );
    }
    await dispatch(
      BookerSelectRestaurantThunks.fetchFoodListFromRestaurant({
        restaurantId,
        menuId,
        timestamp: +dateTime,
      }),
    );
    openRestaurantDetailModal();
  };
  const isEditFoodInProgress = (timestamp: number) => {
    return (
      (searchInProgress || fetchRestaurantFoodInProgress) &&
      selectedTimestamp === timestamp
    );
  };

  const calendarProps = {
    renderEvent: (props: any) => (
      <MealPlanCard
        {...props}
        removeInprogress={props?.resources?.updatePlanDetailInprogress}
        onRemove={handleRemoveMeal(props?.resources?.planId)}
      />
    ),
    resources: {
      ...calendarExtraResources,
      onEditFood: onOpenPickFoodModal,
      editFoodInprogress: isEditFoodInProgress,
      availableOrderDetailCheckList,
      hideEmptySubOrderSection: true,
    },
    components: componentsProps,
  };

  const handleSearchRestaurantSubmit = (
    keywords: string,
    _restaurantId: string,
  ) => {
    dispatch(
      BookerSelectRestaurantThunks.fetchFoodListFromRestaurant({
        keywords,
        restaurantId: selectedRestaurantId,
        menuId,
        timestamp: selectedTimestamp,
      }),
    );
  };
  const handleCloseWalkThrough = () => {
    dispatch(OrderListThunks.disableWalkthrough(currentUserId));
  };

  const handleChatIconClick = () => {
    Gleap.openChat();
  };

  useEffect(() => {
    if (!isEmpty(orderDetail)) {
      dispatch(orderAsyncActions.checkRestaurantStillAvailable({}));
    }
  }, [dispatch, JSON.stringify(orderDetail)]);

  useEffect(() => {
    dispatch(addWorkspaceCompanyId(companyId));
  }, [companyId]);

  useEffect(() => {
    if (!isEmpty(orderState)) {
      if (orderState === EOrderDraftStates.draft) {
        router.push({ pathname: companyPaths.CreateNewOrder });
      } else if (!ENABLE_TO_ACCESS_PAGE_ORDER_STATES.includes(orderState)) {
        router.push({
          pathname: companyPaths.ManageOrderPicking,
          query: { orderId: orderId as string },
        });
      }
    }
  }, [orderId, orderState]);

  return (
    <WalkThroughTourProvider onCloseTour={handleCloseWalkThrough}>
      <RenderWhen condition={isSetupMode}>
        <Layout className={css.root}>
          <LayoutSidebar
            logo={<span></span>}
            collapse={collapse}
            onCollapse={handleCollapse}>
            <SidebarContent order={order} companyAccount={companyAccount} />
          </LayoutSidebar>
          <LayoutMain>
            <div className={css.main}>
              <CalendarDashboard
                className={css.calendar}
                anchorDate={suitableStartDate}
                startDate={startDate}
                endDate={endDate}
                events={orderDetail}
                companyLogo="Company"
                hideMonthView
                {...calendarProps}
              />

              <RenderWhen condition={isAllDatesHaveNoRestaurants}>
                <div className={css.emptyResult}>
                  <div className={css.emptyResultImg}>
                    <Image src={emptyResultImg} alt="empty result" />
                  </div>
                  <div className={css.emptyTitle}>
                    <p>Không tìm thấy kết quả phù hợp</p>
                    <p className={css.emptyContent}>
                      Rất tiếc, hệ thống chúng tôi không tìm thấy kết quả phù
                      hợp với yêu cầu của bạn. Tuy nhiên, đừng ngần ngại{' '}
                      <span>
                        chat với chúng tôi để tìm thấy menu nhanh nhất
                      </span>{' '}
                      nhé.
                    </p>
                    <Button
                      className={css.contactUsBtn}
                      variant="secondary"
                      onClick={handleChatIconClick}>
                      Chat với chúng tôi
                    </Button>
                  </div>
                </div>
              </RenderWhen>
            </div>
            <RenderWhen condition={walkthroughEnable}>
              <WelcomeModal
                isOpen={welcomeModalControl.value}
                onClose={welcomeModalControl.setFalse}
              />
            </RenderWhen>
            <ResultDetailModal
              isOpen={isRestaurantDetailModalOpen}
              onClose={closeRestaurantDetailModal}
              restaurantFood={restaurantFood}
              selectedRestaurantId={selectedRestaurantId}
              restaurants={restaurants}
              companyGeoOrigin={companyGeoOrigin}
              onSearchSubmit={handleSearchRestaurantSubmit}
              fetchFoodInProgress={fetchRestaurantFoodInProgress}
              openFromCalendar
              timestamp={selectedTimestamp}
              packagePerMember={packagePerMember}
            />
          </LayoutMain>
        </Layout>
        <RenderWhen.False>
          <ParticipantInvitation
            onGoBack={handleGoBackFromInvitationView}
            onPublishOrder={handlePublishDraftOrder}
          />
        </RenderWhen.False>
      </RenderWhen>
    </WalkThroughTourProvider>
  );
}

export default BookerDraftOrderPage;
