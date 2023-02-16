import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import IconSetting from '@components/Icons/IconSetting/IconSetting';
import { calculateGroupMembersAmount } from '@helpers/company';
import { parseDateFromTimestampAndHourString } from '@helpers/dateHelpers';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  orderAsyncActions,
  selectCalendarDate,
  selectRestaurant,
  unSelectRestaurant,
  updateDraftMealPlan,
} from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import { getDaySessionFromDeliveryTime, renderDateRange } from '@utils/dates';
import type { TListing, TObject } from '@utils/types';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../NavigateButtons/NavigateButtons';
import OrderSettingModal, {
  OrderSettingField,
} from '../OrderSettingModal/OrderSettingModal';
import type { TSelectFoodFormValues } from '../SelectFoodModal/components/SelectFoodForm/SelectFoodForm';
import SelectFoodModal from '../SelectFoodModal/SelectFoodModal';
import SelectRestaurantPage from '../SelectRestaurantPage/SelectRestaurant.page';
import css from './SetupOrderDetail.module.scss';

const renderResourcesForCalendar = (
  orderDetail: TObject,
  deliveryHour: string,
) => {
  const entries = Object.entries<TObject>(orderDetail);
  const resources = entries.map((item) => {
    const [date, data] = item;
    const { restaurant } = data;
    const { foodList = {} } = restaurant;

    return {
      resource: {
        id: date,
        daySession: getDaySessionFromDeliveryTime(deliveryHour),
        suitableAmount: 10,
        type: 'dailyMeal',
        restaurant: {
          id: restaurant.id,
          name: restaurant.restaurantName,
        },
        foodList: Object.keys(foodList),
        // expiredTime: new Date(2023, 11, 29, 16, 0, 0),
      },
      start: DateTime.fromMillis(Number(date)).toJSDate(),
      end: DateTime.fromMillis(Number(date)).plus({ hour: 1 }).toJSDate(),
    };
  });

  return resources;
};

const findSuitableStartDate = ({
  selectedDate,
  startDate = new Date().getTime(),
  endDate = new Date().getTime(),
  orderDetail = {},
}: {
  selectedDate?: Date;
  startDate?: number;
  endDate?: number;
  orderDetail: TObject;
}) => {
  if (selectedDate && selectedDate instanceof Date) {
    return selectedDate;
  }

  const dateRange = renderDateRange(startDate, endDate);
  const setUpDates = Object.keys(orderDetail);

  if (isEmpty(setUpDates)) {
    return startDate;
  }

  const suitableDateList = dateRange.filter(
    (date) => !setUpDates.includes(date.toString()),
  );
  const suitableStartDate = !isEmpty(suitableDateList)
    ? suitableDateList[0]
    : endDate;

  return suitableStartDate;
};

type TSetupOrderDetailProps = {
  goBack: () => void;
  nextTab: () => void;
};

const SetupOrderDetail: React.FC<TSetupOrderDetailProps> = ({
  goBack,
  nextTab,
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

  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
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
  } = Listing(order as TListing).getMetadata();

  const { title: orderTitle } = Listing(order as TListing).getAttributes();
  const companies = useAppSelector(
    (state) => state.ManageCompaniesPage.companyRefs,
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
    shallowEqual,
  );
  const foodList = useAppSelector(
    (state) => state.SelectRestaurantPage.foodList,
    shallowEqual,
  );
  const suitableStartDate = useMemo(() => {
    const temp = findSuitableStartDate({
      selectedDate,
      startDate,
      endDate,
      orderDetail,
    });

    return temp instanceof Date ? temp : new Date(temp);
  }, [selectedDate, startDate, endDate, orderDetail]);
  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );

  const { address } = deliveryAddress || {};
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );
  const partnerName = currentClient?.attributes.profile.displayName;
  const resourcesForCalender = renderResourcesForCalendar(
    orderDetail,
    deliveryHour,
  );

  const showPickFoodModal = isPickFoodModalOpen && !fetchFoodInProgress;

  const handleAddMorePlanClick = (date: Date) => {
    dispatch(selectCalendarDate(date));
    dispatch(selectRestaurant());
  };

  const handleGoBackWhenSelectingRestaurant = () => {
    dispatch(unSelectRestaurant());
  };

  const handleSubmitRestaurant = (values: Record<string, any>) => {
    const { restaurant, selectedFoodList } = values;
    const updateOrderDetail = {
      orderDetail: {
        restaurantId: restaurant.id,
        restaurantName: restaurant.restaurantName,
        dateTimestamp: (selectedDate as Date).getTime(),
        foodList: selectedFoodList,
      },
    };

    dispatch(updateDraftMealPlan(updateOrderDetail));
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

  const disabledSubmit = Object.keys(orderDetail).length === 0;
  const initialFoodList =
    orderDetail[selectedDate?.getTime()]?.restaurant?.foodList;

  const onSubmit = () => {
    const orderId = Listing(order as TListing).getId();
    const planId = Listing(order as TListing).getMetadata()?.plans?.[0];
    dispatch(
      orderAsyncActions.updatePlanDetail({ orderId, orderDetail, planId }),
    )
      .then(() => {
        nextTab();
      })
      .catch(() => {});
  };

  useEffect(() => {
    dispatch(orderAsyncActions.fetchOrderDetail());
  }, [dispatch]);

  const handleSelectFood = (values: TSelectFoodFormValues) => {
    const { food: foodIds } = values;

    const currRestaurantId = currentRestaurant?.id?.uuid;

    const submitFoodListData = foodIds
      .map((foodId) => {
        const item = foodList.find((food) => food?.id?.uuid === foodId);
        const { id, attributes } = item || {};
        const { title, price } = attributes;

        return { id: id?.uuid, foodName: title, foodPrice: price?.amount || 0 };
      })
      .reduce((result, curr) => {
        const { id, foodName, foodPrice } = curr;

        return { ...result, [id]: { foodName, foodPrice } };
      }, {});

    const submitRestaurantData = {
      id: currRestaurantId,
      restaurantName: currentRestaurant?.attributes?.title,
      phoneNumber: currentRestaurant?.attributes?.publicData?.phoneNumber,
    };

    handleSubmitRestaurant({
      restaurant: submitRestaurantData,
      selectedFoodList: submitFoodListData,
    });
    closePickFoodModal();
  };

  const handlePickFoodModalOpen = () => {
    openPickFoodModal();
  };

  const eventExtraProps = {
    onPickFoodModal: handlePickFoodModalOpen,
  };

  return (
    <>
      {isSelectingRestaurant ? (
        <SelectRestaurantPage
          onSubmitRestaurant={handleSubmitRestaurant}
          selectedDate={selectedDate as Date}
          onBack={handleGoBackWhenSelectingRestaurant}
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

                <Badge label={`Đơn hàng tuần • ${partnerName}`} />
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
              renderEvent={MealPlanCard}
              eventExtraProps={eventExtraProps}
              companyLogo="Company"
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              components={{
                contentEnd: (props) => (
                  <AddMorePlan {...props} {...addMorePlanExtraProps} />
                ),
              }}
              hideMonthView
              recommendButton={
                <div className={css.buttonContainer}>
                  <Button disabled className={css.recommendNewRestaurantBtn}>
                    <IconRefreshing />
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
              inProgress={updateOrderDetailInProgress}
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
        handleSelectFood={handleSelectFood}
      />
    </>
  );
};

export default SetupOrderDetail;
