/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch } from '@hooks/reduxHooks';
import { formatTimestamp } from '@utils/dates';
import { historyPushState } from '@utils/history';

import { orderManagementThunks } from '../../../OrderManagement.slice';

import { usePrepareManageOrdersSectionData } from './hooks/usePrepareManageOrdersSectionData';
import OrderDetailsTable from './OrderDetailsTable/OrderDetailsTable';
import type { TAddOrderFormValues } from './AddOrderForm';
import AddOrderForm from './AddOrderForm';

import css from './ManageOrdersSection.module.scss';

type TManageOrdersSectionProps = {
  data: {
    startDate: number;
    endDate: number;
  };
};

const ManageOrdersSection: React.FC<TManageOrdersSectionProps> = (props) => {
  const {
    data: { startDate },
  } = props;

  const dispatch = useAppDispatch();
  const {
    query: { timestamp },
  } = useRouter();
  const intl = useIntl();
  const [currentViewDate, setCurrentViewDate] = useState(
    timestamp ? Number(timestamp) : startDate,
  );
  const {
    dateList = [],
    defaultActiveKey,
    memberOptions,
    foodOptions,
  } = usePrepareManageOrdersSectionData(currentViewDate, setCurrentViewDate);

  const handleSubmitAddSelection = (values: TAddOrderFormValues) => {
    const { participantId: memberId, requirement = '', foodId } = values;

    const updateValues = {
      memberId,
      foodId,
      requirement,
      currentViewDate,
    };

    dispatch(orderManagementThunks.addOrUpdateMemberOrder(updateValues));
  };

  const items = dateList.map((date) => {
    const formattedDate = formatTimestamp(date, 'EEE, dd/MM');

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
    historyPushState('timestamp', id);
  };

  return (
    <RenderWhen condition={!isEmpty(dateList)}>
      <div className={css.root}>
        <Tabs
          items={items}
          onChange={handleDateTabChange}
          showNavigation
          middleLabel
          defaultActiveKey={defaultActiveKey.toString()}
        />
      </div>
    </RenderWhen>
  );
};

export default ManageOrdersSection;
