import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import { renderDateRange } from '@utils/dates';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TListing, TObject, TUser } from '@utils/types';
import isEmpty from 'lodash/isEmpty';
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
  const { planData, participantData, orderData } = useAppSelector(
    (state) => state.OrderManagement,
  );

  const { participants = [] } = Listing(orderData as TListing).getMetadata();
  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();
  const dateList = renderDateRange(startDate, endDate);

  const { restaurant = {}, memberOrders = {} } =
    orderDetail[currentViewDate.toString()] || {};
  const { foodList = {} } = restaurant;

  const foodOptions = Object.entries<TObject>(foodList).map(
    ([foodId, foodData]) => {
      return {
        foodId,
        foodName: foodData?.foodName || '',
      };
    },
  );

  // Available member IDs to add order details
  const availableMemberIds = isEmpty(memberOrders)
    ? participants
    : (participants as string[]).reduce<string[]>((result, participantId) => {
        const { status = EParticipantOrderStatus.empty } =
          memberOrders[participantId] || {};

        return [
          EParticipantOrderStatus.empty,
          EParticipantOrderStatus.notJoined,
        ].includes(status)
          ? result.concat(participantId)
          : result;
      }, []);

  const memberOptions = availableMemberIds.map((memberId: string) => {
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
