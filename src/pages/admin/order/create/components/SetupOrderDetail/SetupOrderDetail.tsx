import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import IconRefreshing from '@components/Icons/IconRefreshing';
import IconSetting from '@components/IconSetting/IconSetting';
import { calculateGroupMembersAmount } from '@helpers/companyMembers';
import { parseDateFromTimestampAndHourString } from '@helpers/dateHelpers';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../NavigateButtons/NavigateButtons';
import OrderSettingModal, {
  OrderSettingField,
} from '../OrderSettingModal/OrderSettingModal';
import SelectRestaurantPage from '../SelectRestaurantPage/SelectRestaurant.page';
import css from './SetupOrderDetail.module.scss';

const renderResourcesForCalendar = (orderDetail: Record<string, any>) => {
  const entries = Object.entries(orderDetail);

  const resources = entries.map((item) => {
    const [date, data] = item;
    const { restaurant /* foodList */ } = data;

    return {
      resource: {
        id: date,
        daySession: 'MORNING_SESSION',
        suitableAmount: 10,
        type: 'dailyMeal',
        restaurant: {
          id: restaurant.id,
          name: restaurant.restaurantName,
        },
        // expiredTime: new Date(2023, 11, 29, 16, 0, 0),
      },
      title: 'PT3040',
      start: DateTime.fromMillis(Number(date)).toJSDate(),
      end: DateTime.fromMillis(Number(date)).plus({ hour: 1 }).toJSDate(),
    };
  });

  return resources;
};

type TSetupOrderDetailProps = {
  goBack: () => void;
  nextTab: () => void;
};

const SetupOrderDetail: React.FC<TSetupOrderDetailProps> = ({
  goBack,
  nextTab,
}) => {
  const {
    draftOrder: {
      startDate,
      endDate,
      clientId,
      packagePerMember,
      selectedGroups = [],
      deliveryHour,
      deliveryAddress,
      deadlineDate,
      deadlineHour,
      orderDetail = {},
      pickAllow = true,
    },
  } = useAppSelector((state) => state.Order, shallowEqual);
  const companies = useAppSelector(
    (state) => state.ManageCompaniesPage.companyRefs,
    shallowEqual,
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSelectingRestaurant, setIsSelectingRestaurant] = useState(false);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const {
    value: isOrderSettingModalOpen,
    setFalse: onOrderSettingModalClose,
    setTrue: onOrderSettingModalOpen,
  } = useBoolean();

  const { address } = deliveryAddress || {};
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );
  const partnerName = currentClient?.attributes.profile.displayName;
  const resourcesForCalender = renderResourcesForCalendar(orderDetail);

  const handleAddMorePlanClick = (date: Date) => () => {
    setSelectedDate(date);
    setIsSelectingRestaurant(true);
  };

  const handleGoBackWhenSelectingRestaurant = () => {
    setIsSelectingRestaurant(false);
  };

  const handleSubmitRestaurant = (values: Record<string, any>) => {
    const { restaurant, selectedFoodList } = values;
    const updateData = {
      orderDetail: {
        [selectedDate.getTime()]: {
          restaurant,
          foodList: selectedFoodList,
        },
      },
    };

    dispatch(updateDraftMealPlan(updateData));
    setIsSelectingRestaurant(false);
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
      { value: addCommas(packagePerMember.toString()) || '' },
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

  return (
    <>
      {isSelectingRestaurant ? (
        <SelectRestaurantPage
          onSubmitRestaurant={handleSubmitRestaurant}
          selectedDate={selectedDate}
          onBack={handleGoBackWhenSelectingRestaurant}
        />
      ) : (
        <div>
          <div className={css.titleContainer}>
            <div>
              <div className={css.row}>
                <FormattedMessage id="SetupOrderDetail.orderId.draft" />

                <Badge label={`Đơn hàng tuần • ${partnerName}`} />
              </div>
              <div
                className={classNames(css.row, css.settingBtn)}
                onClick={onOrderSettingModalOpen}>
                <IconSetting className={css.settingIcon} />
                <FormattedMessage id="SetupOrderDetail.orderSettings" />
              </div>
            </div>
            <div className={css.buttonContainer}>
              <Button disabled className={css.recommendNewRestaurantBtn}>
                <IconRefreshing />
                <FormattedMessage id="SetupOrderDetail.recommendNewRestaurant" />
              </Button>
            </div>
          </div>
          <div className={css.calendarContainer}>
            <CalendarDashboard
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              events={resourcesForCalender}
              renderEvent={MealPlanCard}
              companyLogo="Company"
              components={{
                contentEnd: (props) => (
                  <AddMorePlan {...props} {...addMorePlanExtraProps} />
                ),
              }}
            />
          </div>
          <div>
            <NavigateButtons goBack={goBack} onNextClick={nextTab} />
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
