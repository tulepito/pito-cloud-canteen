import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import IconSetting from '@components/IconSetting/IconSetting';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import { DateTime } from 'luxon';
import { useState } from 'react';

// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../NavigateButtons/NavigateButtons';
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
    draftOrder: { orderDetail = {} },
  } = useAppSelector((state) => state.Order);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSelectingRestaurant, setIsSelectingRestaurant] = useState(false);
  const dispatch = useAppDispatch();

  const resourcesForCalender = renderResourcesForCalendar(orderDetail);

  const handleAddMorePlanClick = (date: Date) => () => {
    setSelectedDate(date);
    setIsSelectingRestaurant(true);
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

  return (
    <>
      {isSelectingRestaurant ? (
        <SelectRestaurantPage onSubmitRestaurant={handleSubmitRestaurant} />
      ) : (
        <div>
          <div className={css.titleContainer}>
            <div>
              <div className={css.row}>
                <div>#PT1000</div>
                <Badge label="Đơn hàng tuần • Capi Creative" />
              </div>
              <div className={css.row}>
                <IconSetting className={css.settingIcon} />
                <span>Cài đặt bữa ăn</span>
              </div>
            </div>
            <div className={css.buttonContainer}>
              <Button disabled>Cập nhật lại đơn hàng</Button>
              <Button disabled>
                <span>Gợi ý nhà hàng mới</span>
              </Button>
            </div>
          </div>
          <div className={css.calendarContainer}>
            <CalendarDashboard
              events={resourcesForCalender}
              renderEvent={MealPlanCard}
              companyLogo="Company"
              components={{
                contentEnd: (props) => (
                  <AddMorePlan onClick={handleAddMorePlanClick} {...props} />
                ),
              }}
            />
          </div>
          <div>
            <NavigateButtons goBack={goBack} onNextClick={nextTab} />
          </div>
        </div>
      )}
    </>
  );
};

export default SetupOrderDetail;
