/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { DateTime } from 'luxon';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import IconDangerWithCircle from '@components/Icons/IconDangerWithCircle/IconDangerWithCircle';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import IconSetting from '@components/Icons/IconSetting/IconSetting';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { calculateGroupMembersAmount } from '@helpers/company';
import { parseDateFromTimestampAndHourString } from '@helpers/dateHelpers';
import { addCommas } from '@helpers/format';
import {
  findSuitableStartDate,
  getRestaurantListFromOrderDetail,
  getSelectedRestaurantAndFoodList,
} from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { normalizePlanDetailsToEvent } from '@pages/company/booker/orders/draft/[orderId]/helpers/normalizeData';
import { useGetCalendarExtraResources } from '@pages/company/booker/orders/draft/[orderId]/restaurants/hooks/calendar';
import {
  addCurrentSelectedMenuId,
  orderAsyncActions,
  saveDraftEditOrder,
  selectCalendarDate,
  selectRestaurant,
  setCanNotGoToStep4,
  setOnRecommendRestaurantInProcess,
  unSelectRestaurant,
} from '@redux/slices/Order.slice';
import { selectRestaurantPageThunks } from '@redux/slices/SelectRestaurantPage.slice';
import { convertWeekDay, renderDateRange } from '@src/utils/dates';
import { EOrderStates, EOrderType } from '@src/utils/enums';
import { Listing, User } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

// eslint-disable-next-line import/no-cycle
import NavigateButtons, {
  EFlowType,
} from '../../components/NavigateButtons/NavigateButtons';
import OrderSettingModal, {
  OrderSettingField,
} from '../../components/OrderSettingModal/OrderSettingModal';
import type { TSelectFoodFormValues } from '../../components/SelectFoodModal/components/SelectFoodForm/SelectFoodForm';
import SelectFoodModal from '../../components/SelectFoodModal/SelectFoodModal';
import SelectRestaurantPage from '../../components/SelectRestaurantPage/SelectRestaurant.page';

import css from './SetupOrderDetail.module.scss';

type TSetupOrderDetailProps = {
  goBack: () => void;
  nextTab: () => void;
  nextToReviewTab?: () => void;
  flowType?: EFlowType;
};

const SetupOrderDetail: React.FC<TSetupOrderDetailProps> = ({
  goBack,
  nextTab,
  nextToReviewTab,
  flowType = EFlowType.createOrEditDraft,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const {
    value: isOrderSettingModalOpen,
    setFalse: onOrderSettingModalClose,
    setTrue: onOrderSettingModalOpen,
  } = useBoolean();
  const {
    value: isPickFoodModalOpen,
    setTrue: openPickFoodModal,
    setFalse: closePickFoodModal,
  } = useBoolean();
  const confirmChangeOrderDetailControl = useBoolean();
  const shouldNextTabControl = useBoolean();
  const draftEditOrderDetail = useAppSelector(
    (state) => state.Order.draftEditOrderData.orderDetail,
  );
  const draftEditOrderData = useAppSelector(
    (state) => state.Order.draftEditOrderData.generalInfo,
  );
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const selectedCompany = useAppSelector(
    (state) => state.Order.selectedCompany,
    shallowEqual,
  );
  const selectedDate = useAppSelector(
    (state) => state.Order.selectedCalendarDate,
  );
  const isSelectingRestaurant = useAppSelector(
    (state) => state.Order.isSelectingRestaurant,
  );
  const fetchFoodInProgress = useAppSelector(
    (state) => state.SelectRestaurantPage.fetchFoodPending,
  );
  const currentRestaurant = useAppSelector(
    (state) => state.SelectRestaurantPage.selectedRestaurant,
  );
  const foodList = useAppSelector(
    (state) => state.SelectRestaurantPage.foodList,
    shallowEqual,
  );
  const restaurantCoverImageList = useAppSelector(
    (state) => state.Order.restaurantCoverImageList,
    shallowEqual,
  );
  const fetchRestaurantsInProgress = useAppSelector(
    (state) => state.SelectRestaurantPage.fetchRestaurantsPending,
  );
  const currentSelectedMenuId = useAppSelector(
    (state) => state.Order.currentSelectedMenuId,
  );
  const onRecommendRestaurantInProgress = useAppSelector(
    (state) => state.Order.onRecommendRestaurantInProgress,
  );
  const onRescommendRestaurantForSpecificDateInProgress = useAppSelector(
    (state) => state.Order.onRescommendRestaurantForSpecificDateInProgress,
  );
  const availableOrderDetailCheckList = useAppSelector(
    (state) => state.Order.availableOrderDetailCheckList,
    shallowEqual,
  );

  const isEditFlow = flowType === EFlowType.edit;

  const orderGetter = Listing(order as TListing);
  const {
    orderState,
    packagePerMember = '',
    pickAllow = true,
    selectedGroups = [],
    deliveryHour,
    startDate,
    endDate,
    deliveryAddress,
    deadlineDate,
    deadlineHour,
    memberAmount,
    nutritions = [],
    plans = [],
    dayInWeek,
    daySession,
  } = orderGetter.getMetadata();
  const { title: orderTitle } = orderGetter.getAttributes();
  const orderId = orderGetter.getId();
  const planId = plans?.[0];

  const {
    packagePerMember: draftPackagePerMember,
    pickAllow: draftPickAllow,
    selectedGroups: draftSelectGroups,
    deliveryHour: draftDeliveryHour,
    startDate: draftStartDate,
    endDate: draftEndDate,
    deliveryAddress: draftDeliveryAddress,
    deadlineDate: draftDeadlineDate,
    deadlineHour: draftDeadlineHour,
    memberAmount: draftMemberAmount,
    dayInWeek: draftDayInWeek,
    daySession: draftDaySession,
    nutritions: draftNutritions,
  } = draftEditOrderData;
  const { address: draftAddress, origin: draftOrigin } =
    draftDeliveryAddress || {};

  const isPickingOrder = orderState === EOrderStates.picking;
  const shouldHideRemoveMealIcon = isEditFlow && isPickingOrder;
  const shouldHideAddMorePlan = isEditFlow && isPickingOrder;

  const missingSelectedFood = Object.keys(orderDetail).filter(
    (dateTime) => orderDetail[dateTime]?.restaurant?.foodList?.length === 0,
  );
  const draftSelectedFoodTime = Object.keys(draftEditOrderDetail!).filter(
    (dateTime) =>
      !isEmpty(draftEditOrderDetail?.[dateTime]?.restaurant?.foodList),
  );
  const draftSelectedFoodDays = draftSelectedFoodTime.map(
    (time) => convertWeekDay(DateTime.fromMillis(Number(time)).weekday).key,
  );

  const suitableStartDate = useMemo(() => {
    const temp = isEditFlow
      ? findSuitableStartDate({
          selectedDate,
          startDate: draftStartDate || startDate,
          endDate: draftEndDate || endDate,
          orderDetail: draftEditOrderDetail || orderDetail,
        })
      : findSuitableStartDate({
          selectedDate,
          startDate,
          endDate,
          orderDetail,
        });

    return temp instanceof Date ? temp : new Date(temp!);
  }, [
    isEditFlow,
    selectedDate,
    draftStartDate,
    startDate,
    draftEndDate,
    endDate,
    JSON.stringify(orderDetail),
    JSON.stringify(draftEditOrderDetail),
  ]);
  const suitableDayInWeek = useMemo(() => {
    if (isEditFlow) {
      return draftDayInWeek || dayInWeek;
    }

    return dayInWeek;
  }, [isEditFlow, JSON.stringify(dayInWeek), JSON.stringify(draftDayInWeek)]);

  const { address, origin } = deliveryAddress || {};
  const { lastName: clientLastName, firstName: clientFirstName } =
    User(selectedCompany).getProfile();
  const partnerName = `${clientLastName} ${clientFirstName}`;
  const resourcesForCalender = useMemo(
    () =>
      isEditFlow
        ? normalizePlanDetailsToEvent(
            draftEditOrderDetail || orderDetail,
            {
              deliveryHour: draftDeliveryHour || deliveryHour,
              daySession: draftDaySession || daySession,
            },
            restaurantCoverImageList,
          )
        : normalizePlanDetailsToEvent(
            orderDetail,
            {
              deliveryHour,
              daySession,
            },
            restaurantCoverImageList,
          ),
    [
      isEditFlow,
      deliveryHour,
      draftDeliveryHour,
      daySession,
      draftDaySession,
      JSON.stringify(restaurantCoverImageList),
      JSON.stringify(orderDetail),
      JSON.stringify(draftEditOrderDetail),
    ],
  );
  const showPickFoodModal = isPickFoodModalOpen && !fetchFoodInProgress;

  const allCompanyGroups =
    selectedCompany?.attributes.profile.metadata.groups?.reduce(
      (result: any, group: any) => {
        return {
          ...result,
          [group.id]: group.name,
        };
      },
      {},
    ) || {};
  const selectedGroupsName = (draftSelectGroups || selectedGroups).map(
    (groupId: string) => {
      if (groupId === 'allMembers') {
        return intl.formatMessage({ id: 'ParticipantSetupField.allMembers' });
      }

      return allCompanyGroups[groupId];
    },
  );
  const pickingDeadline = parseDateFromTimestampAndHourString(
    draftDeadlineDate || deadlineDate,
    draftDeadlineHour || deadlineHour,
    'dd/MM/yyyy, hh:mm',
  );
  const allMembersAmount =
    draftMemberAmount ||
    memberAmount ||
    (selectedCompany &&
      calculateGroupMembersAmount(
        selectedCompany,
        draftSelectGroups || selectedGroups,
      ));

  const initialOrderSettingValues = useMemo(
    () => ({
      [OrderSettingField.COMPANY]:
        selectedCompany?.attributes.profile.publicData.companyName,
      [OrderSettingField.DELIVERY_ADDRESS]: draftAddress || address,
      [OrderSettingField.DELIVERY_TIME]: draftDeliveryHour || deliveryHour,
      [OrderSettingField.EMPLOYEE_AMOUNT]: allMembersAmount,
      [OrderSettingField.SPECIAL_DEMAND]: '',
      [OrderSettingField.PER_PACK]: intl.formatMessage(
        { id: 'SetupOrderDetail.perPack' },
        {
          value:
            addCommas(
              (draftPackagePerMember || packagePerMember)?.toString(),
            ) || '',
        },
      ),
      ...(typeof draftPickAllow !== 'undefined'
        ? draftPickAllow
        : pickAllow
        ? {
            [OrderSettingField.PICKING_DEADLINE]: pickingDeadline,
            [OrderSettingField.ACCESS_SETTING]: (
              draftSelectGroups || selectedGroupsName
            )?.join(', '),
          }
        : {}),
    }),
    [
      draftAddress,
      address,
      allMembersAmount,
      selectedCompany?.attributes.profile.publicData.companyName,
      draftDeliveryHour,
      deliveryHour,
      draftPackagePerMember,
      packagePerMember,
      draftPickAllow,
      pickAllow,
      pickingDeadline,
      JSON.stringify(draftSelectGroups),
      JSON.stringify(selectedGroupsName),
    ],
  );

  const inProgress =
    (updateOrderInProgress || updateOrderDetailInProgress) &&
    !onRecommendRestaurantInProgress;
  const isOrderDetailChanged = !isEqual(orderDetail, draftEditOrderDetail);
  const shouldShowConfirmChangedModal =
    isPickingOrder && isEditFlow && isOrderDetailChanged;
  const disabledSubmit =
    !isEditFlow &&
    (Object.keys(orderDetail).length === 0 ||
      missingSelectedFood.length > 0 ||
      Object.keys(availableOrderDetailCheckList).some(
        (item) => !availableOrderDetailCheckList[item].isAvailable,
      ));
  const initialFoodList = isPickFoodModalOpen
    ? (draftEditOrderDetail || orderDetail)[selectedDate?.getTime()]?.restaurant
        ?.foodList
    : {};

  const onApplyOtherDaysInProgress = updateOrderDetailInProgress;
  const restaurantListFromOrder = Object.keys(
    getRestaurantListFromOrderDetail(
      isEditFlow
        ? isEmpty(draftEditOrderDetail)
          ? orderDetail
          : draftEditOrderDetail
        : orderDetail,
    ),
  );
  const recommendParams = {
    startDate: draftStartDate || startDate,
    endDate: draftEndDate || endDate,
    dayInWeek: isPickingOrder ? draftSelectedFoodDays : suitableDayInWeek,
    deliveryOrigin: draftOrigin || origin,
    memberAmount: draftMemberAmount || memberAmount,
    isNormalOrder:
      draftPickAllow || pickAllow ? EOrderType.group : EOrderType.normal,
    nutritions: draftNutritions || nutritions,
    packagePerMember: draftPackagePerMember || packagePerMember,
    daySession: draftDaySession || daySession,
    orderDetail: draftEditOrderDetail || orderDetail,
  };

  // TODO: handle next tab and next to review tab clicks
  const handleNextTabClick = () => {
    dispatch(setCanNotGoToStep4(false));

    if (shouldShowConfirmChangedModal) {
      confirmChangeOrderDetailControl.setTrue();
      shouldNextTabControl.setTrue();
    } else {
      nextTab();
    }
  };
  const handleNextReviewTabClick = () => {
    if (shouldShowConfirmChangedModal) {
      confirmChangeOrderDetailControl.setTrue();
    } else if (nextToReviewTab) {
      nextToReviewTab();
    }
  };

  // TODO: handle confirm order detail changed action clicks
  const handleConfirmOrderDetailChanges = () => {
    confirmChangeOrderDetailControl.setFalse();
    if (shouldNextTabControl.value) {
      nextTab();
    } else if (nextToReviewTab) nextToReviewTab();
  };
  const handleRejectOrderDetailChanges = () => {
    dispatch(
      saveDraftEditOrder({
        orderDetail,
      }),
    );
    handleConfirmOrderDetailChanges();
  };

  // TODO: handle click add more plan
  const handleAddMorePlanClick = (date: Date) => {
    dispatch(selectCalendarDate(date));
    dispatch(selectRestaurant());
  };

  // TODO: handle go back calendar flow when selecting restaurant
  const handleGoBackWhenSelectingRestaurant = () => {
    dispatch(unSelectRestaurant());
  };

  const handleSubmitRestaurant = async (values: TObject) => {
    const { restaurant, selectedFoodList } = values;
    const subOrderDate = (selectedDate as Date).getTime();
    const restaurantData = {
      restaurant: {
        id: restaurant.id,
        restaurantName: restaurant.restaurantName,
        menuId: restaurant.menuId,
        phoneNumber: restaurant.phoneNumber,
        foodList: selectedFoodList,
        minQuantity: restaurant.minQuantity || 1,
        maxQuantity: restaurant.maxQuantity || 100,
      },
    };

    if (isEditFlow) {
      dispatch(
        saveDraftEditOrder({
          orderDetail: {
            ...draftEditOrderDetail,
            [subOrderDate]: {
              ...(draftEditOrderDetail?.[subOrderDate] || {}),
              ...restaurantData,
            },
          },
        }),
      );
    } else {
      dispatch(setCanNotGoToStep4(true));
      await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          orderDetail: {
            [subOrderDate]: restaurantData,
          },
          planId,
          updateMode: 'merge',
        }),
      );
    }

    dispatch(unSelectRestaurant());
  };

  // TODO: check edit food is in progress
  const onEditFoodInProgress = (timestamp: number) => {
    return (
      (fetchFoodInProgress || fetchRestaurantsInProgress) &&
      selectedDate?.getTime() === timestamp
    );
  };

  // TODO: check recommend restaurant for day is in progress
  const onRecommendRestaurantForSpecificDayInProgress = (timestamp: number) => {
    return (
      onRescommendRestaurantForSpecificDateInProgress &&
      selectedDate?.getTime() === timestamp
    );
  };

  // TODO: handle selecting food from food modal
  const handleSelectFood = async (values: TSelectFoodFormValues) => {
    dispatch(setCanNotGoToStep4(true));
    const { food: foodIds } = values;

    const { submitRestaurantData, submitFoodListData } =
      getSelectedRestaurantAndFoodList({
        foodList,
        foodIds,
        currentRestaurant,
      });

    await handleSubmitRestaurant({
      restaurant: { ...submitRestaurantData, menuId: currentSelectedMenuId },
      selectedFoodList: submitFoodListData,
    });
    closePickFoodModal();
  };

  // TODO: handle change food in meal
  const handleEditFoodInMealPlanCard = async (
    dateTime: any,
    restaurantId: string,
    menuId: string,
  ) => {
    dispatch(selectCalendarDate(DateTime.fromMillis(+dateTime).toJSDate()));
    dispatch(addCurrentSelectedMenuId(menuId));
    await dispatch(
      selectRestaurantPageThunks.fetchSelectedRestaurant(restaurantId),
    );
    await dispatch(
      selectRestaurantPageThunks.getRestaurantFood({
        menuId,
        subOrderDate: dateTime,
      }),
    );
    openPickFoodModal();
  };

  // TODO: handle remove day's meal
  const handleRemoveMeal = useCallback(
    (id: string) => (resourceId: string) => {
      dispatch(setCanNotGoToStep4(true));
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

  // TODO: handle recommend restaurant days in week
  const onRecommendNewRestaurants = useCallback(async () => {
    dispatch(setOnRecommendRestaurantInProcess(true));

    if (isEditFlow) {
      const { payload: recommendOrderDetail }: any = await dispatch(
        orderAsyncActions.recommendRestaurants({
          shouldUpdatePlanOrderOrderDetail: false,
          recommendParams,
        }),
      );
      dispatch(
        saveDraftEditOrder({
          orderDetail: recommendOrderDetail,
        }),
      );
    } else {
      const { payload: recommendOrderDetail }: any = await dispatch(
        orderAsyncActions.recommendRestaurants({
          shouldUpdatePlanOrderOrderDetail: true,
        }),
      );
      await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId,
          orderDetail: recommendOrderDetail,
        }),
      );
    }
    dispatch(setOnRecommendRestaurantInProcess(false));
  }, []);

  // TODO: handle recommend restaurant for specific day
  const onRecommendRestaurantForSpecificDay = (date: number) => {
    dispatch(selectCalendarDate(DateTime.fromMillis(date).toJSDate()));
    dispatch(
      orderAsyncActions.recommendRestaurantForSpecificDay({
        shouldUpdatePlanOrderOrderDetail: !isEditFlow,
        dateTime: date,
        ...(isEditFlow ? { recommendParams } : {}),
      }),
    );
  };

  // TODO: handle apply meal for other days
  const onApplyOtherDays = useCallback(
    async (date: string, selectedDates: string[]) => {
      const totalDates = renderDateRange(
        draftStartDate || startDate,
        draftEndDate || endDate,
      );
      const newOrderDetail = totalDates.reduce((result, curr) => {
        const currWeekday = convertWeekDay(
          DateTime.fromMillis(curr).weekday,
        ).key;

        if (selectedDates.includes(currWeekday)) {
          if (
            isPickingOrder &&
            isEditFlow &&
            !draftSelectedFoodDays.includes(currWeekday)
          ) {
            return result;
          }

          return {
            ...result,
            [curr]: {
              ...orderDetail[curr],
              restaurant: orderDetail[date]?.restaurant || {},
            },
          };
        }

        return result;
      }, draftEditOrderDetail || orderDetail);
      if (isEditFlow) {
        dispatch(
          saveDraftEditOrder({
            orderDetail: newOrderDetail,
          }),
        );
      } else {
        dispatch(setCanNotGoToStep4(true));

        await dispatch(
          orderAsyncActions.updatePlanDetail({
            orderId,
            planId,
            orderDetail: newOrderDetail,
          }),
        );
      }
    },
    [
      dispatch,
      orderId,
      isPickingOrder,
      isEditFlow,
      JSON.stringify(draftSelectedFoodDays),
      JSON.stringify(orderDetail),
      JSON.stringify(draftEditOrderDetail),
      planId,
      selectedDate,
      draftStartDate,
      startDate,
      draftEndDate,
      endDate,
    ],
  );

  // TODO: prepare calendar resources and props
  const defaultCalendarExtraResources = useGetCalendarExtraResources({
    order,
    startDate: draftStartDate || startDate,
    endDate: draftEndDate || endDate,
  });
  const calendarExtraResources = {
    ...defaultCalendarExtraResources,
    onEditFood: handleEditFoodInMealPlanCard,
    onSearchRestaurant: handleAddMorePlanClick,
    onEditFoodInProgress,
    dayInWeek: suitableDayInWeek,
    onApplyOtherDays,
    onApplyOtherDaysInProgress,
    onRecommendRestaurantForSpecificDay,
    onRecommendRestaurantForSpecificDayInProgress,
    availableOrderDetailCheckList,
    shouldHideAddMorePlan,
    shouldHideRemoveMealIcon,
  };
  const addMorePlanExtraProps = {
    onClick: handleAddMorePlanClick,
    startDate: draftStartDate || startDate,
    endDate: draftEndDate || endDate,
  };
  const renderEvent = (props: any) => {
    return (
      <MealPlanCard
        {...props}
        removeInprogress={props?.resources?.updatePlanDetailInprogress}
        onRemove={handleRemoveMeal(props?.resources?.planId)}
      />
    );
  };
  const calendarComponents = {
    contentEnd: (props: any) => (
      <AddMorePlan {...props} {...addMorePlanExtraProps} />
    ),
  };
  const recommendButton = (
    <div className={css.buttonContainer}>
      <Button
        onClick={onRecommendNewRestaurants}
        variant="secondary"
        className={css.recommendNewRestaurantBtn}>
        <IconRefreshing inProgress={onRecommendRestaurantInProgress} />
        <FormattedMessage id="SetupOrderDetail.recommendNewRestaurant" />
      </Button>
    </div>
  );

  useEffect(() => {
    if (!isEmpty(restaurantListFromOrder)) {
      dispatch(orderAsyncActions.fetchRestaurantCoverImages({ isEditFlow }));
    }
  }, [JSON.stringify(restaurantListFromOrder), isEditFlow]);

  useEffect(() => {
    if (!isEmpty(orderDetail)) {
      dispatch(orderAsyncActions.checkRestaurantStillAvailable());
    }
  }, [dispatch, JSON.stringify(orderDetail)]);

  return (
    <>
      <RenderWhen condition={isSelectingRestaurant}>
        <SelectRestaurantPage
          onSubmitRestaurant={handleSubmitRestaurant}
          selectedDate={selectedDate as Date}
          onBack={handleGoBackWhenSelectingRestaurant}
          selectFoodInProgress={updateOrderDetailInProgress}
        />
        <RenderWhen.False>
          <div>
            <div className={css.titleContainer}>
              <div>
                <div className={css.row}>
                  {orderTitle ? (
                    <span className={css.orderTitle}>{`#${orderTitle}`}</span>
                  ) : (
                    <span className={css.orderTitle}>
                      {intl.formatMessage({
                        id: 'SetupOrderDetail.orderId.draft',
                      })}
                    </span>
                  )}

                  <Badge
                    label={`Đơn hàng tuần • ${partnerName}`}
                    type={EBadgeType.info}
                  />
                </div>
                <div
                  className={classNames(css.row, css.settingBtn)}
                  onClick={onOrderSettingModalOpen}>
                  <IconSetting className={css.settingIcon} />
                  <FormattedMessage id="SetupOrderDetail.orderSettings" />
                </div>
              </div>
            </div>
            <div className={css.calendarContainer}>
              <CalendarDashboard
                anchorDate={suitableStartDate}
                events={resourcesForCalender}
                renderEvent={renderEvent}
                companyLogo="Company"
                startDate={new Date(draftStartDate || startDate)}
                endDate={new Date(draftEndDate || endDate)}
                resources={calendarExtraResources}
                components={calendarComponents}
                hideMonthView
                recommendButton={recommendButton}
              />
            </div>
            <NavigateButtons
              goBack={goBack}
              onNextClick={handleNextTabClick}
              submitDisabled={disabledSubmit}
              inProgress={inProgress}
              onCompleteClick={handleNextReviewTabClick}
              flowType={flowType}
            />
            <OrderSettingModal
              isOpen={isOrderSettingModalOpen}
              onClose={onOrderSettingModalClose}
              initialFieldValues={initialOrderSettingValues}
            />
          </div>
        </RenderWhen.False>
      </RenderWhen>
      <SelectFoodModal
        restaurant={currentRestaurant}
        items={foodList as any[]}
        isOpen={showPickFoodModal}
        initialFoodList={initialFoodList}
        handleClose={closePickFoodModal}
        selectFoodInProgress={updateOrderDetailInProgress}
        handleSelectFood={handleSelectFood}
      />
      <AlertModal
        isOpen={confirmChangeOrderDetailControl.value}
        containerClassName={css.confirmOrderDetailChanged}
        handleClose={confirmChangeOrderDetailControl.setFalse}
        cancelLabel={'Huỷ thay đổi'}
        shouldHideIconClose
        confirmLabel={'Tiếp tục'}
        onCancel={handleRejectOrderDetailChanges}
        onConfirm={handleConfirmOrderDetailChanges}
        childrenClassName={css.confirmOrderDetailChangedChildren}
        actionsClassName={css.confirmOrderDetailChangedActions}>
        <div className={css.modalIconContainer}>
          <IconDangerWithCircle />
        </div>
        <div className={css.description}>
          Những lựa chọn Nhà hàng & Món ăn sẽ thay đổi.
        </div>
      </AlertModal>
    </>
  );
};

export default SetupOrderDetail;
