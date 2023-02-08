import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/components/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import IconSetting from '@components/Icons/IconSetting/IconSetting';
import { calculateGroupMembersAmount } from '@helpers/companyMembers';
import { parseDateFromTimestampAndHourString } from '@helpers/dateHelpers';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  OrderAsyncAction,
  selectCalendarDate,
  selectRestaurant,
  unSelectRestaurant,
  updateDraftMealPlan,
} from '@redux/slices/Order.slice';
import { LISTING } from '@utils/data';
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
import SelectRestaurantPage from '../SelectRestaurantPage/SelectRestaurant.page';
import css from './SetupOrderDetail.module.scss';

const renderResourcesForCalendar = (
  orderDetail: TObject,
  deliveryHour: string,
) => {
  const entries = Object.entries<TObject>(orderDetail);
  const resources = entries.map((item) => {
    const [date, data] = item;
    const { restaurant, foodList } = data;

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
        foodList,
        // expiredTime: new Date(2023, 11, 29, 16, 0, 0),
      },
      title: 'PT3040',
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

  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
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
  } = LISTING(order as TListing).getMetadata();
  const { title: orderTitle } = LISTING(order as TListing).getAttributes();
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

  const suitableStartDate = useMemo(() => {
    const temp = findSuitableStartDate({
      selectedDate,
      startDate,
      endDate,
      orderDetail,
    });

    return temp instanceof Date ? temp : new Date(temp);
  }, [selectedDate, startDate, endDate, orderDetail]);

  const { address } = deliveryAddress || {};
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );
  const partnerName = currentClient?.attributes.profile.displayName;
  const resourcesForCalender = renderResourcesForCalendar(
    orderDetail,
    deliveryHour,
  );

  const handleAddMorePlanClick = (date: Date) => () => {
    dispatch(selectCalendarDate(date));
    dispatch(selectRestaurant());
  };

  const handleGoBackWhenSelectingRestaurant = () => {
    dispatch(unSelectRestaurant());
  };

  const handleSubmitRestaurant = (values: Record<string, any>) => {
    const { restaurant, selectedFoodList } = values;
    const updateData = {
      orderDetail: {
        [(selectedDate as Date).getTime()]: {
          restaurant,
          foodList: selectedFoodList,
        },
      },
    };

    dispatch(updateDraftMealPlan(updateData));
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
    currentClient && calculateGroupMembersAmount(currentClient, selectedGroups);

  const initialFieldValues = {
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
  };
  const addMorePlanExtraProps = {
    onClick: handleAddMorePlanClick,
    startDate,
    endDate,
  };

  const onSubmit = () => {
    dispatch(OrderAsyncAction.updateOrder({ orderDetail }))
      .then(() => {
        nextTab();
      })
      .catch(() => {});
  };

  useEffect(() => {
    dispatch(OrderAsyncAction.fetchOrderDetail());
  }, []);

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
              companyLogo="Company"
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              components={{
                contentEnd: (props) => (
                  <AddMorePlan {...props} {...addMorePlanExtraProps} />
                ),
              }}
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
              inProgress={updateOrderInProgress}
            />
          </div>
          <OrderSettingModal
            isOpen={isOrderSettingModalOpen}
            onClose={onOrderSettingModalClose}
            initialFieldValues={initialFieldValues}
          />
        </div>
      )}
    </>
  );
};

export default SetupOrderDetail;
