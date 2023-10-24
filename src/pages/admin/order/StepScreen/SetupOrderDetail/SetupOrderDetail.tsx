/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import IconSetting from '@components/Icons/IconSetting/IconSetting';
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
  selectCalendarDate,
  selectRestaurant,
  setCanNotGoToStep4,
  setOnRecommendRestaurantInProcess,
  unSelectRestaurant,
} from '@redux/slices/Order.slice';
import { selectRestaurantPageThunks } from '@redux/slices/SelectRestaurantPage.slice';
import { convertWeekDay, renderDateRange } from '@src/utils/dates';
import { Listing } from '@utils/data';
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
  const justDeletedMemberOrder = useAppSelector(
    (state) => state.Order.justDeletedMemberOrder,
  );

  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const {
    companyId: clientId,
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
    plans = [],
    dayInWeek,
  } = Listing(order as TListing).getMetadata();
  const { title: orderTitle } = Listing(order as TListing).getAttributes();
  const companies = useAppSelector(
    (state) => state.company.companyRefs,
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

  const orderId = Listing(order as TListing).getId();
  const planId = Listing(order as TListing).getMetadata()?.plans?.[0];

  const suitableStartDate = useMemo(() => {
    const temp = findSuitableStartDate({
      selectedDate,
      startDate,
      endDate,
      orderDetail,
    });

    return temp instanceof Date ? temp : new Date(temp!);
  }, [selectedDate, startDate, endDate, orderDetail]);

  const { address } = deliveryAddress || {};
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );
  const partnerName = `${currentClient?.attributes.profile.lastName} ${currentClient?.attributes.profile.firstName}`;
  const resourcesForCalender = normalizePlanDetailsToEvent(
    orderDetail,
    order,
    restaurantCoverImageList,
  );

  const showPickFoodModal = isPickFoodModalOpen && !fetchFoodInProgress;

  const handleAddMorePlanClick = (date: Date) => {
    dispatch(selectCalendarDate(date));
    dispatch(selectRestaurant());
  };

  const handleGoBackWhenSelectingRestaurant = () => {
    dispatch(unSelectRestaurant());
  };

  const handleSubmitRestaurant = async (values: TObject) => {
    const { restaurant, selectedFoodList } = values;

    dispatch(setCanNotGoToStep4(true));
    await dispatch(
      orderAsyncActions.updatePlanDetail({
        orderId,
        orderDetail: {
          [(selectedDate as Date).getTime()]: {
            restaurant: {
              id: restaurant.id,
              restaurantName: restaurant.restaurantName,
              menuId: restaurant.menuId,
              phoneNumber: restaurant.phoneNumber,
              foodList: selectedFoodList,
              minQuantity: restaurant.minQuantity || 1,
              maxQuantity: restaurant.maxQuantity || 100,
            },
          },
        },
        planId,
        updateMode: 'merge',
      }),
    );
    dispatch(unSelectRestaurant());
  };

  const allCompanyGroups =
    currentClient?.attributes.profile.metadata.groups?.reduce(
      (result: any, group: any) => {
        return {
          ...result,
          [group.id]: group.name,
        };
      },
      {},
    ) || {};
  const selectedGroupsName = selectedGroups.map((groupId: string) => {
    if (groupId === 'allMembers') {
      return intl.formatMessage({ id: 'ParticipantSetupField.allMembers' });
    }

    return allCompanyGroups[groupId];
  });
  const pickingDeadline = parseDateFromTimestampAndHourString(
    deadlineDate,
    deadlineHour,
    'dd/MM/yyyy, hh:mm',
  );
  const allMembersAmount =
    memberAmount ||
    (currentClient &&
      calculateGroupMembersAmount(currentClient, selectedGroups));

  const initialFieldValues = useMemo(
    () => ({
      [OrderSettingField.COMPANY]:
        currentClient?.attributes.profile.publicData.companyName,
      [OrderSettingField.DELIVERY_ADDRESS]: address,
      [OrderSettingField.DELIVERY_TIME]: deliveryHour,
      [OrderSettingField.EMPLOYEE_AMOUNT]: allMembersAmount,
      [OrderSettingField.SPECIAL_DEMAND]: '',
      [OrderSettingField.PER_PACK]: intl.formatMessage(
        { id: 'SetupOrderDetail.perPack' },
        { value: addCommas(packagePerMember?.toString()) || '' },
      ),
      ...(pickAllow
        ? {
            [OrderSettingField.PICKING_DEADLINE]: pickingDeadline,
            [OrderSettingField.ACCESS_SETTING]: selectedGroupsName?.join(', '),
          }
        : {}),
    }),
    [
      address,
      allMembersAmount,
      currentClient?.attributes.profile.publicData.companyName,
      deliveryHour,
      intl,
      packagePerMember,
      pickAllow,
      pickingDeadline,
      selectedGroupsName,
    ],
  );
  const addMorePlanExtraProps = {
    onClick: handleAddMorePlanClick,
    startDate,
    endDate,
  };

  const inProgress =
    (updateOrderInProgress || updateOrderDetailInProgress) &&
    !onRecommendRestaurantInProgress;

  const missingSelectedFood = Object.keys(orderDetail).filter(
    (dateTime) => orderDetail[dateTime].restaurant.foodList.length === 0,
  );

  const disabledSubmit =
    Object.keys(orderDetail).length === 0 ||
    missingSelectedFood.length > 0 ||
    Object.keys(availableOrderDetailCheckList).some(
      (item) => !availableOrderDetailCheckList[item].isAvailable,
    );
  const initialFoodList = isPickFoodModalOpen
    ? orderDetail[selectedDate?.getTime()]?.restaurant?.foodList
    : {};

  const calendarExtraResources = useGetCalendarExtraResources({
    order,
    startDate,
    endDate,
  });
  const onApplyOtherDaysInProgress = updateOrderDetailInProgress;

  const onSubmit = () => {
    dispatch(setCanNotGoToStep4(false));
    nextTab();
  };

  useEffect(() => {
    if (isEmpty(orderDetail) && !justDeletedMemberOrder && !isEmpty(plans)) {
      dispatch(orderAsyncActions.fetchOrderDetail(plans));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(order),
    JSON.stringify(orderDetail),
    JSON.stringify(plans),
  ]);

  useEffect(() => {
    if (!isEmpty(orderDetail)) {
      dispatch(orderAsyncActions.checkRestaurantStillAvailable());
    }
  }, [dispatch, JSON.stringify(orderDetail)]);

  const restaurantListFromOrder = Object.keys(
    getRestaurantListFromOrderDetail(orderDetail),
  );

  useEffect(() => {
    if (!isEmpty(restaurantListFromOrder)) {
      dispatch(orderAsyncActions.fetchRestaurantCoverImages());
    }
  }, [JSON.stringify(restaurantListFromOrder)]);

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

  const onEditFoodInMealPlanCard = async (
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

  const onEditFoodInProgress = (timestamp: number) => {
    return (
      (fetchFoodInProgress || fetchRestaurantsInProgress) &&
      selectedDate?.getTime() === timestamp
    );
  };

  const onRecommendRestaurantForSpecificDayInProgress = (timestamp: number) => {
    return (
      onRescommendRestaurantForSpecificDateInProgress &&
      selectedDate?.getTime() === timestamp
    );
  };

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

  const onRecommendNewRestaurants = useCallback(async () => {
    dispatch(setOnRecommendRestaurantInProcess(true));
    const { payload: recommendOrderDetail }: any = await dispatch(
      orderAsyncActions.recommendRestaurants({}),
    );
    await dispatch(
      orderAsyncActions.updatePlanDetail({
        orderId,
        planId,
        orderDetail: recommendOrderDetail,
      }),
    );
    dispatch(setOnRecommendRestaurantInProcess(false));
  }, []);

  const onApplyOtherDays = useCallback(
    async (date: string, selectedDates: string[]) => {
      const totalDates = renderDateRange(startDate, endDate);
      const newOrderDetail = totalDates.reduce((result, curr) => {
        if (
          selectedDates.includes(
            convertWeekDay(DateTime.fromMillis(curr).weekday).key,
          )
        ) {
          return {
            ...result,
            [curr]: { ...orderDetail[date] },
          };
        }

        return result;
      }, orderDetail);
      dispatch(setCanNotGoToStep4(true));
      await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId,
          orderDetail: newOrderDetail,
        }),
      );
    },
    [dispatch, orderId, orderDetail, planId, selectedDate],
  );

  const onRecommendRestaurantForSpecificDay = (date: number) => {
    dispatch(selectCalendarDate(DateTime.fromMillis(date).toJSDate()));
    dispatch(
      orderAsyncActions.recommendRestaurantForSpecificDay({ dateTime: date }),
    );
  };

  return (
    <>
      {isSelectingRestaurant ? (
        <SelectRestaurantPage
          onSubmitRestaurant={handleSubmitRestaurant}
          selectedDate={selectedDate as Date}
          onBack={handleGoBackWhenSelectingRestaurant}
          selectFoodInProgress={updateOrderDetailInProgress}
        />
      ) : (
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
              renderEvent={(props: any) => (
                <MealPlanCard
                  {...props}
                  removeInprogress={
                    props?.resources?.updatePlanDetailInprogress
                  }
                  onRemove={handleRemoveMeal(props?.resources?.planId)}
                />
              )}
              companyLogo="Company"
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              resources={{
                ...calendarExtraResources,
                onEditFood: onEditFoodInMealPlanCard,
                onSearchRestaurant: handleAddMorePlanClick,
                onEditFoodInProgress,
                onApplyOtherDays,
                dayInWeek,
                onApplyOtherDaysInProgress,
                onRecommendRestaurantForSpecificDay,
                onRecommendRestaurantForSpecificDayInProgress,
                availableOrderDetailCheckList,
              }}
              components={{
                contentEnd: (props) => (
                  <AddMorePlan {...props} {...addMorePlanExtraProps} />
                ),
              }}
              hideMonthView
              recommendButton={
                <div className={css.buttonContainer}>
                  <Button
                    onClick={onRecommendNewRestaurants}
                    variant="secondary"
                    className={css.recommendNewRestaurantBtn}>
                    <IconRefreshing
                      inProgress={onRecommendRestaurantInProgress}
                    />
                    <FormattedMessage id="SetupOrderDetail.recommendNewRestaurant" />
                  </Button>
                </div>
              }
            />
          </div>
          <div>
            <NavigateButtons
              goBack={goBack}
              onNextClick={onSubmit}
              submitDisabled={disabledSubmit}
              inProgress={inProgress}
              onCompleteClick={nextToReviewTab}
              flowType={flowType}
            />
          </div>
          <OrderSettingModal
            isOpen={isOrderSettingModalOpen}
            onClose={onOrderSettingModalClose}
            initialFieldValues={initialFieldValues}
          />
        </div>
      )}
      <SelectFoodModal
        restaurant={currentRestaurant}
        items={foodList as any[]}
        isOpen={showPickFoodModal}
        initialFoodList={initialFoodList}
        handleClose={closePickFoodModal}
        selectFoodInProgress={updateOrderDetailInProgress}
        handleSelectFood={handleSelectFood}
      />
    </>
  );
};

export default SetupOrderDetail;
