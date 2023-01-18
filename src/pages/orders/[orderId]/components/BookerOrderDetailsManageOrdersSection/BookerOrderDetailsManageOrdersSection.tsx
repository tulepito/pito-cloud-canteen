import Button from '@components/Button/Button';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
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

import { BookerOrderManagementsThunks } from '../../BookerOrderManagement.slice';
import type { TAddOrderFormValues } from './AddOrderForm';
import AddOrderForm from './AddOrderForm';
import css from './BookerOrderDetailsManageOrdersSection.module.scss';
import OrderDetailsTable from './OrderDetailsTable';

type TBookerOrderDetailsManageOrdersSectionProps = {
  data: {
    startDate: number;
    endDate: number;
  };
};

const BookerOrderDetailsManageOrdersSection: React.FC<
  TBookerOrderDetailsManageOrdersSectionProps
> = (props) => {
  const {
    data: { startDate, endDate },
  } = props;

  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [currentViewDate, setCurrentViewDate] = useState(startDate);
  const { planData, participantData } = useAppSelector(
    (state) => state.BookerOrderManagement,
  );

  const orderDetail = get(planData, 'attributes.metadata.orderDetail', {});
  const dateList = renderDateRange(startDate, endDate);

  const { foodList = {}, memberOrders = {} } =
    orderDetail[currentViewDate.toString()] || {};
  const foodOptions = Object.entries(foodList).map(([foodId, foodData]) => {
    return {
      foodId,
      foodName: (foodData as TObject)?.foodName || '',
    };
  });

  // Available member IDs to adding order details
  const availableMemberIds = Object.entries(memberOrders).reduce(
    (result, current) => {
      const [memberId, order] = current;
      const { status } = order as TObject;

      if (
        status === EParticipantOrderStatus.empty ||
        status === EParticipantOrderStatus.notJoined
      ) {
        return [...(result as string[]), memberId];
      }
      return result;
    },
    [] as string[],
  );

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

    dispatch(BookerOrderManagementsThunks.addOrUpdateMemberOrder(updateValues));
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
              id: 'BookerOrderDetailsManageOrdersSection.manageOrdersContainer.title',
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
                id: 'BookerOrderDetailsManageOrdersSection.addOrder.title',
              })}
              <AddOrderForm
                onSubmit={handleSubmitAddSelection}
                foodOptions={foodOptions}
                memberOptions={memberOptions}
              />
            </div>
          </div>
          <div className={css.addRequirement}>
            <Button
              variant="inline"
              type="button"
              className={css.addRequirementBtn}>
              <IconPlus className={css.plusIcon} />
              <span>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsManageOrdersSection.addRequirement.text',
                })}
              </span>
            </Button>
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
      <Tabs items={items} onChange={handleDateTabChange} showNavigation />
    </div>
  );
};

export default BookerOrderDetailsManageOrdersSection;
