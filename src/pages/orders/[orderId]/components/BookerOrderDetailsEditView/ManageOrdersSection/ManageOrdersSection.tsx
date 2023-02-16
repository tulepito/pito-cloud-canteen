import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { renderDateRange } from '@utils/dates';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject, TUser } from '@utils/types';
import get from 'lodash/get';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import { orderManagementThunks } from '../../../OrderManagement.slice';
import type { TAddOrderFormValues } from './AddOrderForm';
import AddOrderForm from './AddOrderForm';
import css from './ManageOrdersSection.module.scss';
import OrderDetailsTable from './OrderDetailsTable/OrderDetailsTable';

type TManageOrdersSectionProps = {
  data: {
    startDate: number;
    endDate: number;
  };
};

const ManageOrdersSection: React.FC<TManageOrdersSectionProps> = (props) => {
  const {
    data: { startDate, endDate },
  } = props;

  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [currentViewDate, setCurrentViewDate] = useState(startDate);
  const { planData, participantData } = useAppSelector(
    (state) => state.OrderManagement,
  );

  const orderDetail = get(planData, 'attributes.metadata.orderDetail', {});
  const dateList = renderDateRange(startDate, endDate);

  const {
    restaurant: { foodList = {} },
    memberOrders = {},
  } = orderDetail[currentViewDate.toString()] || {};
  const foodOptions = Object.entries<TObject>(foodList).map(
    ([foodId, foodData]) => {
      return {
        foodId,
        foodName: foodData?.foodName || '',
      };
    },
  );

  // Available member IDs to add order details
  const availableMemberIds = Object.entries<TObject>(memberOrders).reduce<
    string[]
  >((result, current) => {
    const [memberId, order] = current;
    const { status } = order;

    if (
      status === EParticipantOrderStatus.empty ||
      status === EParticipantOrderStatus.notJoined
    ) {
      return [...result, memberId];
    }
    return result;
  }, []);

  const memberOptions = availableMemberIds.map((memberId) => {
    const participant = participantData.find(
      (p: TUser) => p.id.uuid === memberId,
    );

    const memberName =
      participant?.attributes.profile.displayName ||
      participant?.attributes.email ||
      '';

    return {
      memberId,
      memberName,
    };
  });

  const handleSubmitAddSelection = (values: TAddOrderFormValues) => {
    const { participantId, requirement, foodId } = values;

    const updateValues = {
      memberId: participantId,
      foodId,
      requirement: requirement || '',
      currentViewDate,
    };

    dispatch(orderManagementThunks.addOrUpdateMemberOrder(updateValues));
  };

  const items = dateList.map((date) => {
    const formattedDate = DateTime.fromMillis(date).toFormat('EEE, dd/MM', {
      locale: 'vi',
    });

    return {
      label: <div>{formattedDate}</div>,
      children: (
        <div className={css.manageOrdersContainer}>
          <div className={css.title}>
            {intl.formatMessage({
              id: 'ManageOrdersSection.manageOrdersContainer.title',
            })}
          </div>
          <div className={css.orderDetails}>
            <OrderDetailsTable
              currentViewDate={currentViewDate}
              foodOptions={foodOptions}
            />
          </div>
          <div className={css.addOrder}>
            <div className={css.addOrderTitle}>
              {intl.formatMessage({
                id: 'ManageOrdersSection.addOrder.title',
              })}
              <AddOrderForm
                onSubmit={handleSubmitAddSelection}
                foodOptions={foodOptions}
                memberOptions={memberOptions}
              />
            </div>
          </div>
        </div>
      ),
      id: date.toString(),
    };
  });

  const handleDateTabChange = ({ id }: TTabsItem) => {
    setCurrentViewDate(Number(id));
  };

  return (
    <div className={css.root}>
      <Tabs
        items={items}
        onChange={handleDateTabChange}
        showNavigation
        middleLabel
      />
    </div>
  );
};

export default ManageOrdersSection;
