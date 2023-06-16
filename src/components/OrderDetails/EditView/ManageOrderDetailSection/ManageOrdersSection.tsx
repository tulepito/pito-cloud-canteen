/* eslint-disable react-hooks/exhaustive-deps */
import type { Dispatch, SetStateAction } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { formatTimestamp } from '@src/utils/dates';
import { historyPushState } from '@src/utils/history';
import type { TObject } from '@src/utils/types';

import type { TAddOrderFormValues } from './AddOrEditOrderDetail/AddOrderForm';
import AddOrderForm from './AddOrEditOrderDetail/AddOrderForm';
import { usePrepareManageOrdersSectionData } from './hooks/usePrepareManageOrdersSectionData';
import OrderDetailsTable from './OrderDetailsTable/OrderDetailsTable';

import css from './ManageOrdersSection.module.scss';

type TManageOrdersSectionProps = {
  ableToUpdateOrder: boolean;
  currentViewDate: number;
  setCurrentViewDate: Dispatch<SetStateAction<number>>;
  isDraftEditing: boolean;
};

const ManageOrdersSection: React.FC<TManageOrdersSectionProps> = (props) => {
  const {
    ableToUpdateOrder,
    currentViewDate,
    setCurrentViewDate,
    isDraftEditing,
  } = props;

  const dispatch = useAppDispatch();

  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const {
    dateList = [],
    defaultActiveKey,
    memberOptions,
    foodOptions,
  } = usePrepareManageOrdersSectionData(currentViewDate, setCurrentViewDate);

  const handleSubmitAddSelection = async (values: TAddOrderFormValues) => {
    const { participantId: memberId, requirement = '', foodId } = values;
    const member = memberOptions.find((m: TObject) => m.memberId === memberId);
    const updateValues = {
      memberId,
      foodId,
      requirement,
      currentViewDate,
      memberEmail: member.memberEmail,
    };

    if (isDraftEditing) {
      return dispatch(
        OrderManagementsAction.updateDraftOrderDetail(updateValues),
      );
    }
    await dispatch(orderManagementThunks.addOrUpdateMemberOrder(updateValues));
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
              ableToUpdateOrder={ableToUpdateOrder}
              isDraftEditing={isDraftEditing}
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
                ableToUpdateOrder={ableToUpdateOrder}
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
          disabled={inProgress}
          items={items}
          onChange={handleDateTabChange}
          showNavigation
          middleLabel
          defaultActiveKey={defaultActiveKey.toString()}
        />
      </div>

      <RenderWhen.False>
        <Skeleton className={css.rootSkeleton} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default ManageOrdersSection;
