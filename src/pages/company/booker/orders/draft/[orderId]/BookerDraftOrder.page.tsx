/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import Image from 'next/image';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import { getBookerMockupSubOrder } from '@components/CalendarDashboard/helpers/mockupData';
import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import IconEmpty from '@components/Icons/IconEmpty/IconEmpty';
import IconHome from '@components/Icons/IconHome/IconHome';
import IconMagicWand from '@components/Icons/IconMagicWand/IconMagicWand';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import IconSetting from '@components/Icons/IconSetting/IconSetting';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Stepper from '@components/Stepper/Stepper';
import { BOTTOM_CENTER_TOAST_ID } from '@components/ToastifyProvider/ToastifyProvider';
import {
  findSuitableAnchorDate,
  getParticipantPickingLink,
} from '@helpers/order/prepareDataHelper';
import { isEnableSubmitPublishOrder } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useRestaurantDetailModal from '@hooks/useRestaurantDetailModal';
import { useViewport } from '@hooks/useViewport';
import {
  filterHasAccountUserIds,
  filterHasAccountUsers,
  filterNoAccountUserEmail,
  useAddMemberEmail,
} from '@pages/company/[companyId]/members/hooks/useAddMemberEmail';
import { OrderListThunks } from '@pages/participant/orders/OrderList.slice';
import { addWorkspaceCompanyId } from '@redux/slices/company.slice';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { BOOKER_CREATE_GROUP_ORDER_STEPS } from '@src/constants/stepperSteps';
import { companyPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import Gleap from '@src/utils/gleap';
import { Listing, User } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderType,
} from '@utils/enums';
import type { TListing, TObject, TUser } from '@utils/types';

import emptyResultImg from '../../../../../../assets/emptyResult.png';
import Layout from '../../components/Layout/Layout';
import LayoutMain from '../../components/Layout/LayoutMain';
import LayoutSidebar from '../../components/Layout/LayoutSidebar';

import BookerStepperDesktopSection from './components/BookerStepperDesktopSection/BookerStepperDesktopSection';
import HomeReturnModal from './components/HomeReturnModal/HomeReturnModal';
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
import {
  BookerDraftOrderPageActions,
  BookerDraftOrderPageThunks,
} from './BookerDraftOrderPage.slice';

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
  const { orderId, subOrderDate: subOrderDateQuery } = router.query;
  const [collapse, setCollapse] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(0);
  const [currentViewMode, setCurrViewMode] =
    useState<EBookerDraftOrderViewMode>(EBookerDraftOrderViewMode.setup);
  const dispatch = useAppDispatch();
  const { isTabletLayoutOrLarger } = useViewport();
  const { selectedDay, handleSelectDay } = useSelectDay();
  const [sampleSubOrder, setSampleSubOrder] = useState<any>(undefined);

  const homeReturnModalController = useBoolean();

  const currentUser = useAppSelector(currentUserSelector);
  // * Walkthrough
  const currentUserGetter = User(currentUser);
  const currentUserId = currentUserGetter.getId();
  const { walkthroughEnable = true } = currentUserGetter.getMetadata();
  const welcomeModalControl = useBoolean(walkthroughEnable);
  const { checkEmailList } = useAddMemberEmail();
  const { order, companyAccount } = useLoadData({
    orderId: orderId as string,
  });
  useGetOrder({ orderId: orderId as string });

  const fetchOrderParticipantsInProgress = useAppSelector(
    (state) => state.BookerDraftOrderPage.fetchOrderParticipantsInProgress,
  );
  const addOrderParticipantsInProgress = useAppSelector(
    (state) => state.BookerDraftOrderPage.addOrderParticipantsInProgress,
  );
  const participantData = useAppSelector(
    (state) => state.BookerDraftOrderPage.participantData,
  );
  const toastShowedAfterSuccessfullyCreatingOrder = useAppSelector(
    (state) =>
      state.BookerDraftOrderPage.toastShowedAfterSuccessfullyCreatingOrder,
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
  const { orderDetail = [], rawOrderDetail } = useGetPlanDetails();
  const calendarEvents =
    walkthroughEnable && !isEmpty(sampleSubOrder)
      ? [sampleSubOrder]
      : orderDetail;
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
  const orderListing = Listing(order as TListing);
  const {
    orderState,
    plans = [],
    orderType = EOrderType.normal,
    startDate: startDateTimestamp,
    endDate: endDateTimestamp,
    packagePerMember = 0,
    companyId,
    orderDeadline,
    participants = [],
    nonAccountEmails = [],
  } = orderListing.getMetadata();
  const { title: orderTitle } = orderListing.getAttributes();
  const planId = plans.length > 0 ? plans[0] : undefined;
  const isGroupOrder = orderType === EOrderType.group;

  const isFinishOrderDisabled =
    addOrderParticipantsInProgress ||
    (isGroupOrder && fetchOrderParticipantsInProgress) ||
    !isEnableSubmitPublishOrder(
      order as TListing,
      orderDetail,
      availableOrderDetailCheckList,
      ['deadlineDate', 'deadlineHour'],
    );

  const companyGeoOrigin = useMemo(
    () => ({
      ...User(companyAccount as TUser).getPublicData()?.companyLocation?.origin,
    }),
    [JSON.stringify(companyAccount)],
  );

  const selectedEvent = useMemo(() => {
    return orderDetail.find(
      (event) => Number(event.start) === Number(selectedDay),
    );
  }, [JSON.stringify(orderDetail), selectedDay]);

  const suitableAnchorDate = useMemo(() => {
    const temp = findSuitableAnchorDate({
      selectedDate: selectedDay,
      startDate: startDateTimestamp,
      endDate: endDateTimestamp,
      orderDetail: rawOrderDetail,
    });

    return temp instanceof Date ? temp : new Date(temp!);
    // eslint-disable-next-line prettier/prettier
  }, [
    selectedDay,
    startDateTimestamp,
    endDateTimestamp,
    JSON.stringify(orderDetail),
  ]);

  const handlePublishDraftOrder = async () => {
    const { meta } = await dispatch(
      orderAsyncActions.publishOrder({ orderId, planId }),
    );
    if (meta.requestStatus !== 'rejected') {
      if (!isSetupMode) {
        await dispatch(
          BookerDraftOrderPageThunks.sendRemindEmailToMembers({
            orderId: orderId as string,
            orderLink: getParticipantPickingLink(orderId as string),
            deadline: formatTimestamp(orderDeadline, 'HH:mm EEE,dd/MM/yyyy'),
            memberIdList: participantData.map((p) => p.id.uuid),
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

  const handleCloseSideBar = useCallback(() => {
    setCollapse(false);
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
      companyGeoOrigin,
    },
    components: componentsProps,
  };

  const checkAndInviteNonAccountEmails = async () => {
    const newLoadedResult = (await checkEmailList(
      nonAccountEmails,
    )) as TObject[];

    const newNonAccountEmails = filterNoAccountUserEmail(newLoadedResult);
    const newUserIds = filterHasAccountUserIds(newLoadedResult);
    const newUsers = filterHasAccountUsers(newLoadedResult);

    if (!isEmpty(newUserIds)) {
      dispatch(
        BookerDraftOrderPageThunks.addOrderParticipants({
          orderId,
          participants,
          newUserIds,
          newUsers,
          nonAccountEmails: newNonAccountEmails,
        }),
      );
    }
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

  const handleAddMealClick = () => {
    router.push(
      `/company/booker/orders/draft/${orderId}/restaurants?timestamp=${Number(
        selectedDay,
      )}`,
    );
  };

  useEffect(() => {
    if (!isEmpty(orderDetail)) {
      const menuListingIds = orderDetail?.map(
        (order) => order.resource.restaurant?.menuId,
      );

      dispatch(orderAsyncActions.fetchOrderRestaurants({}));
      dispatch(
        orderAsyncActions.fetchMenuListingsByIds({
          menuListingIds,
        }),
      );
    }
    dispatch(orderAsyncActions.checkRestaurantStillAvailable({}));
  }, [dispatch, JSON.stringify(orderDetail)]);

  useEffect(() => {
    dispatch(addWorkspaceCompanyId(companyId));
  }, [companyId]);

  useEffect(() => {
    if (!isEmpty(nonAccountEmails)) {
      checkAndInviteNonAccountEmails();
    }
  }, [JSON.stringify(nonAccountEmails)]);

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

  const toastOrderSuccessfullyCreated = () => {
    dispatch(
      BookerDraftOrderPageActions.setToastShowedAfterSuccessfullyCreatingOrder(
        false,
      ),
    );
    toast.info(
      'PITO đã gợi ý một menu phù hợp dựa trên ngân sách và các yêu cầu của bạn.',
      {
        closeButton: false,
        autoClose: 5000,
        hideProgressBar: true,
        containerId: BOTTOM_CENTER_TOAST_ID,
        toastId: 'BookerDraftOrderPage.OrderSuccessfullyCreated',
        icon: <IconMagicWand className={css.toastIcon} />,
        className: css.toastContainer,
      },
    );
  };

  useEffect(() => {
    if (toastShowedAfterSuccessfullyCreatingOrder) {
      toastOrderSuccessfullyCreated();
    }
  }, [toastShowedAfterSuccessfullyCreatingOrder]);

  useEffect(() => {
    const mockupSubOrder = getBookerMockupSubOrder(startDate);
    setSampleSubOrder(mockupSubOrder);
  }, [startDate]);

  useEffect(() => {
    handleSelectDay(startDate);
  }, [startDate]);

  useEffect(() => {
    if (subOrderDateQuery) {
      const subOrderDate = new Date(+subOrderDateQuery);
      handleSelectDay(subOrderDate);
    }
  }, [subOrderDateQuery]);

  return (
    <>
      <RenderWhen condition={isGroupOrder}>
        <BookerStepperDesktopSection>
          <Stepper
            className={css.stepperContainerDesktop}
            steps={BOOKER_CREATE_GROUP_ORDER_STEPS}
            currentStep={isSetupMode ? 1 : 2}
          />
        </BookerStepperDesktopSection>
      </RenderWhen>
      <WalkThroughTourProvider
        onCloseTour={handleCloseWalkThrough}
        isMobileLayout={!isTabletLayoutOrLarger}>
        <RenderWhen condition={isSetupMode}>
          <Layout className={css.root}>
            <LayoutSidebar
              logo={<span></span>}
              collapse={collapse}
              onCollapse={handleCollapse}>
              <SidebarContent
                order={order}
                companyAccount={companyAccount}
                onCloseSideBar={handleCloseSideBar}
              />
            </LayoutSidebar>
            <LayoutMain className={css.mainContainer}>
              <div className={css.header}>
                <div className={css.title}>Thiết lập menu</div>
                <div className={css.headerActions}>
                  <IconHome
                    className={css.actionIcon}
                    onClick={homeReturnModalController.setTrue}
                  />
                  <div className={css.actionIcon} onClick={handleCollapse}>
                    <IconSetting variant="black" />
                  </div>
                </div>
              </div>
              <RenderWhen condition={isGroupOrder}>
                <div className={css.stepperContainerMobile}>
                  <Stepper
                    steps={BOOKER_CREATE_GROUP_ORDER_STEPS}
                    currentStep={1}
                  />
                </div>
              </RenderWhen>
              <div className={css.orderTitleWrapper}>
                <div className={css.title}>Đơn hàng #{orderTitle}</div>
                <Badge
                  label="Đơn hàng tuần"
                  type={EBadgeType.info}
                  className={css.badge}
                />
              </div>

              <div className={css.main}>
                <CalendarDashboard
                  className={css.calendar}
                  anchorDate={suitableAnchorDate}
                  startDate={startDate}
                  endDate={endDate}
                  events={calendarEvents}
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
              <div className={css.subOrderMobileWrapper}>
                <RenderWhen condition={walkthroughEnable}>
                  <div
                    className={classNames(
                      css.subOrderDate,
                      !isGroupOrder && css.largePadding,
                    )}>
                    <RenderWhen condition={!!sampleSubOrder}>
                      <MealPlanCard
                        event={sampleSubOrder as Event}
                        index={123}
                        resources={{}}
                        removeInprogress={false}
                      />
                    </RenderWhen>
                  </div>
                  <RenderWhen.False>
                    <RenderWhen condition={!!selectedEvent}>
                      <MealPlanCard
                        event={selectedEvent as Event}
                        index={999}
                        resources={{ ...calendarProps.resources }}
                        removeInprogress={
                          calendarProps?.resources?.updatePlanDetailInprogress
                        }
                        onRemove={handleRemoveMeal(planId)}
                      />
                      <RenderWhen.False>
                        <RenderWhen condition={!isAllDatesHaveNoRestaurants}>
                          <div className={css.addMealWrapper}>
                            <IconEmpty variant="food" />
                            <div className={css.emptyText}>Chưa có bữa ăn</div>
                            <div
                              className={css.addMeal}
                              onClick={handleAddMealClick}>
                              <IconPlus className={css.plusIcon} />
                              <span>Thêm bữa ăn</span>
                            </div>
                          </div>
                        </RenderWhen>
                      </RenderWhen.False>
                    </RenderWhen>
                  </RenderWhen.False>
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
              <HomeReturnModal
                isOpen={homeReturnModalController.value}
                onClose={homeReturnModalController.setFalse}
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
    </>
  );
}

export default BookerDraftOrderPage;
