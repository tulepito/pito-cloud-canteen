import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import AddMorePlan from '@components/CalendarDashboard/components/MealPlanCard/AddMorePlan';
import MealPlanCard from '@components/CalendarDashboard/components/MealPlanCard/MealPlanCard';
import IconSetting from '@components/IconSetting/IconSetting';
import { useAppSelector } from '@hooks/reduxHooks';

import css from './SetupOrderDetail.module.scss';

const renderResourcesForCalendar = (orderDetail: Record<string, any>) => {
  const entries = Object.entries(orderDetail);
  console.log(entries);

  return [
    {
      resource: {
        id: '1',
        daySession: 'MORNING_SESSION',
        suitableAmount: 10,
        status: 'notJoined',
        type: 'dailyMeal',
        deliveryAddress: {
          address: '133 Duong Ba Trac',
          ward: '1',
          district: '8',
          city: 'Ho Chi Minh',
          country: 'Vietnam',
        },
        restaurant: {
          id: '12',
          name: 'Vua Hải Sản',
        },
        expiredTime: new Date(2023, 11, 29, 16, 0, 0),
        meal: {
          dishes: [
            { key: 'mon_an_1', value: 'Mon an 1' },
            { key: 'mon_an_2', value: 'Mon an 2' },
            { key: 'mon_an_3', value: 'Mon an 3' },
          ],
        },
      },
      title: 'PT3040',
      start: new Date(2023, 0, 4, 16, 0, 0),
      end: new Date(2023, 0, 4, 20, 0, 0),
    },
  ];
};

const SetupOrderDetail = () => {
  const { draftOrder: orderDetail = {} } = useAppSelector(
    (state) => state.Order,
  );

  const resourcesForCalender = renderResourcesForCalendar(orderDetail);

  return (
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
          companyLogo="Chu"
          components={{
            contentEnd: (props) => <AddMorePlan {...props} />,
          }}
        />
      </div>
    </div>
  );
};

export default SetupOrderDetail;
