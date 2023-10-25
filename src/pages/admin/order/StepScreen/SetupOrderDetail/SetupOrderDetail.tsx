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
import { EOrderType } from '@src/utils/enums';
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

  const suitableStartDate = useMemo(() => {
    const temp = findSuitableStartDate({
      selectedDate,
      startDate: draftStartDate || startDate,
      endDate: draftEndDate || endDate,
      orderDetail: draftEditOrderDetail || orderDetail,
    });

    return temp instanceof Date ? temp : new Date(temp!);
  }, [
    selectedDate,
    draftStartDate,
    startDate,
    draftEndDate,
    endDate,
    JSON.stringify(orderDetail),
    JSON.stringify(draftEditOrderDetail),
  ]);
  const { address, origin } = deliveryAddress || {};
  const { lastName: clientLastName, firstName: clientFirstName } =
    User(selectedCompany).getProfile();
  const partnerName = `${clientLastName} ${clientFirstName}`;
  const resourcesForCalender = useMemo(
    () =>
      normalizePlanDetailsToEvent(
        draftEditOrderDetail || orderDetail,
        {
          deliveryHour: draftDeliveryHour || deliveryHour,
          daySession: draftDaySession || daySession,
        },
        restaurantCoverImageList,
      ),
    [
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

  const handleAddMorePlanClick = (date: Date) => {
    dispatch(selectCalendarDate(date));
    dispatch(selectRestaurant());
  };

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
            [subOrderDate]: restaurantData,
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
  const recommendParams = {
    startDate: draftStartDate || startDate,
    endDate: draftEndDate || endDate,
    dayInWeek: draftDayInWeek || dayInWeek,
    deliveryOrigin: draftOrigin || origin,
    memberAmount: draftMemberAmount || memberAmount,
    isNormalOrder:
      draftPickAllow || pickAllow ? EOrderType.group : EOrderType.normal,
    nutritions: draftNutritions || nutritions,
    packagePerMember: draftPackagePerMember || packagePerMember,
    daySession: draftDaySession || daySession,
  };

  const initialFieldValues = useMemo(
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
  const addMorePlanExtraProps = {
    onClick: handleAddMorePlanClick,
    startDate: draftStartDate || startDate,
    endDate: draftEndDate || endDate,
  };

  const inProgress =
    (updateOrderInProgress || updateOrderDetailInProgress) &&
    !onRecommendRestaurantInProgress;

  const missingSelectedFood = Object.keys(orderDetail).filter(
    (dateTime) => orderDetail[dateTime]?.restaurant?.foodList?.length === 0,
  );
  // eslint-disable-next-line unused-imports/no-unused-vars
  const missingDraftSelectedFood = Object.keys(
    draftEditOrderDetail || {},
  ).filter(
    (dateTime) =>
      draftEditOrderDetail?.[dateTime]?.restaurant?.foodList?.length === 0,
  );

  const disabledSubmit =
    Object.keys(orderDetail).length === 0 ||
    missingSelectedFood.length > 0 ||
    Object.keys(availableOrderDetailCheckList).some(
      (item) => !availableOrderDetailCheckList[item].isAvailable,
    );
  const initialFoodList = isPickFoodModalOpen
    ? (draftEditOrderDetail || orderDetail)[selectedDate?.getTime()]?.restaurant
        ?.foodList
    : {};

  const calendarExtraResources = useGetCalendarExtraResources({
    order,
    startDate: draftStartDate || startDate,
    endDate: draftEndDate || endDate,
  });
  const onApplyOtherDaysInProgress = updateOrderDetailInProgress;

  const onSubmit = () => {
    dispatch(setCanNotGoToStep4(false));
    nextTab();
  };

  const restaurantListFromOrder = Object.keys(
    getRestaurantListFromOrderDetail(
      isEditFlow
        ? isEmpty(draftEditOrderDetail)
          ? orderDetail
          : draftEditOrderDetail
        : orderDetail,
    ),
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

  const onApplyOtherDays = useCallback(
    async (date: string, selectedDates: string[]) => {
      const totalDates = renderDateRange(
        draftStartDate || startDate,
        draftEndDate || endDate,
      );
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
      }, draftEditOrderDetail || orderDetail);

      if (isEditFlow) {
        saveDraftEditOrder({
          orderDetail: newOrderDetail,
        });
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
                renderEvent={(props: any) => {
                  return (
                    <MealPlanCard
                      {...props}
                      removeInprogress={
                        props?.resources?.updatePlanDetailInprogress
                      }
                      onRemove={handleRemoveMeal(props?.resources?.planId)}
                    />
                  );
                }}
                companyLogo="Company"
                startDate={new Date(draftStartDate || startDate)}
                endDate={new Date(draftEndDate || endDate)}
                resources={{
                  ...calendarExtraResources,
                  onEditFood: onEditFoodInMealPlanCard,
                  onSearchRestaurant: handleAddMorePlanClick,
                  onEditFoodInProgress,
                  onApplyOtherDays,
                  dayInWeek: draftDayInWeek || dayInWeek,
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
    </>
  );
};

export default SetupOrderDetail;
