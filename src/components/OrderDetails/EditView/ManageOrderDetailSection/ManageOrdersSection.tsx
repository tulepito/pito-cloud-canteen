/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

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
import { EMAIL_RE } from '@src/utils/validators';

import type { TAddOrderFormValues } from './AddOrEditOrderDetail/AddOrderForm';
import AddOrderForm from './AddOrEditOrderDetail/AddOrderForm';
import { usePrepareManageOrdersSectionData } from './hooks/usePrepareManageOrdersSectionData';
import OrderDetailsTable from './OrderDetailsTable/OrderDetailsTable';

import css from './ManageOrdersSection.module.scss';

type TManageOrdersSectionProps = {
  ableToUpdateOrder: boolean;
  currentViewDate: number;
  setCurrentViewDate: (date: number) => void;
  isDraftEditing: boolean;
  handleOpenReachMaxAllowedChangesModal?: (type: string) => void;
  shouldShowOverflowError?: boolean;
  shouldShowUnderError?: boolean;
  planReachMaxRestaurantQuantityInPickingState?: boolean;
  planReachMinRestaurantQuantityInPickingState?: boolean;
};

const ManageOrdersSection: React.FC<TManageOrdersSectionProps> = (props) => {
  const {
    ableToUpdateOrder,
    currentViewDate,
    setCurrentViewDate,
    isDraftEditing,
    handleOpenReachMaxAllowedChangesModal,
    shouldShowOverflowError,
    shouldShowUnderError,
    planReachMaxRestaurantQuantityInPickingState,
    planReachMinRestaurantQuantityInPickingState,
  } = props;

  const dispatch = useAppDispatch();
  const {
    isReady,
    query: { timestamp },
  } = useRouter();
  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const {
    dateList = [],
    memberOptions,
    foodOptions,
    currentOrderDetail,
  } = usePrepareManageOrdersSectionData(currentViewDate, setCurrentViewDate);

  const { restaurant = {} } = currentOrderDetail;
  const { maxQuantity, minQuantity } = restaurant;
  const handleSubmitAddSelection = async (values: TAddOrderFormValues) => {
    const { participantId, requirement = '', foodId } = values;
    const selectParticipantValue = participantId.key;
    const isUsingEmail = EMAIL_RE.test(selectParticipantValue);

    const member = memberOptions.find(
      (m: TObject) => m.memberId === selectParticipantValue,
    );
    const updateValues = {
      foodId,
      requirement,
      currentViewDate,
      ...(isUsingEmail
        ? { memberEmail: selectParticipantValue }
        : {
            memberId: selectParticipantValue,
            memberEmail: member?.memberEmail,
          }),
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
              handleOpenReachMaxAllowedChangesModal={
                handleOpenReachMaxAllowedChangesModal
              }
              shouldShowOverflowError={shouldShowOverflowError}
              minQuantity={minQuantity}
              maxQuantity={maxQuantity}
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
                isDraftEditing={isDraftEditing}
                shouldShowUnderError={shouldShowUnderError}
                shouldShowOverflowError={shouldShowOverflowError}
                maxQuantity={maxQuantity}
                minQuantity={minQuantity}
                currentViewDate={currentViewDate}
                planReachMaxRestaurantQuantityInPickingState={
                  planReachMaxRestaurantQuantityInPickingState
                }
                planReachMinRestaurantQuantityInPickingState={
                  planReachMinRestaurantQuantityInPickingState
                }
              />
            </div>
          </div>
        </div>
      ),
      id: date.toString(),
    };
  });

  const defaultActiveKey = items.findIndex(
    ({ id }) => id === currentViewDate.toString(),
  );

  const handleDateTabChange = ({ id }: TTabsItem) => {
    setCurrentViewDate(Number(id));
    historyPushState('timestamp', id);
  };

  useEffect(() => {
    if (isReady) {
      setCurrentViewDate(Number(timestamp));
    }
  }, [isReady, timestamp]);

  return (
    <RenderWhen condition={!isEmpty(dateList)}>
      <div className={css.root}>
        <Tabs
          disabled={inProgress}
          items={items}
          onChange={handleDateTabChange}
          showNavigation
          middleLabel
          defaultActiveKey={`${
            (defaultActiveKey < 0 ? 0 : defaultActiveKey) + 1
          }`}
        />
      </div>

      <RenderWhen.False>
        <Skeleton className={css.rootSkeleton} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default ManageOrdersSection;
