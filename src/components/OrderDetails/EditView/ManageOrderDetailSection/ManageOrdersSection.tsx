/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { historyPushState } from '@helpers/urlHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { formatTimestamp } from '@src/utils/dates';
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
  planReachMaxCanModify?: boolean;
  planReachMaxRestaurantQuantity?: boolean;
  planReachMinRestaurantQuantity?: boolean;
  isAdminFlow?: boolean;
};

const ManageOrdersSection: React.FC<TManageOrdersSectionProps> = (props) => {
  const {
    ableToUpdateOrder,
    currentViewDate,
    setCurrentViewDate,
    isDraftEditing,
    handleOpenReachMaxAllowedChangesModal,
    planReachMaxCanModify,
    planReachMaxRestaurantQuantity,
    planReachMinRestaurantQuantity,
    isAdminFlow = false,
  } = props;

  const dispatch = useAppDispatch();
  const {
    isReady,
    query: { timestamp },
  } = useRouter();
  const intl = useIntl();
  const addOrderRowModalControl = useBoolean();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const {
    dateList = [],
    memberOptions,
    foodOptions,
    currentOrderDetail,
    hasSubOrders,
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

    const memberInfo = isUsingEmail
      ? { memberEmail: selectParticipantValue }
      : {
          memberId: selectParticipantValue,
          memberEmail: member?.memberEmail,
        };

    const updateValues = {
      foodId,
      requirement,
      currentViewDate,
      isAdminFlow,
      ...memberInfo,
    };

    if (isDraftEditing) {
      return dispatch(
        OrderManagementsAction.updateDraftOrderDetail(updateValues),
      );
    }
    await dispatch(orderManagementThunks.addOrUpdateMemberOrder(updateValues));
  };

  const addOrderRowTitle = intl.formatMessage({
    id: 'ManageOrdersSection.addOrder.title',
  });
  const addOrderRowFormComponent = (
    <AddOrderForm
      onSubmit={handleSubmitAddSelection}
      foodOptions={foodOptions}
      memberOptions={memberOptions}
      ableToUpdateOrder={ableToUpdateOrder}
      isDraftEditing={isDraftEditing}
      planReachMaxRestaurantQuantity={planReachMaxRestaurantQuantity}
      planReachMinRestaurantQuantity={planReachMinRestaurantQuantity}
      planReachMaxCanModify={planReachMaxCanModify}
      maxQuantity={maxQuantity}
      minQuantity={minQuantity}
      currentViewDate={currentViewDate}
    />
  );

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
          <OrderDetailsTable
            currentViewDate={currentViewDate}
            foodOptions={foodOptions}
            ableToUpdateOrder={ableToUpdateOrder}
            isDraftEditing={isDraftEditing}
            handleOpenReachMaxAllowedChangesModal={
              handleOpenReachMaxAllowedChangesModal
            }
            shouldShowOverflowError={
              planReachMaxRestaurantQuantity || planReachMaxCanModify
            }
            minQuantity={minQuantity}
            maxQuantity={maxQuantity}
            isAdminFlow={isAdminFlow}
          />
          <div className={css.addOrder}>
            <div className={css.mobileSection}>
              {planReachMaxCanModify && (
                <ErrorMessage
                  className={css.error}
                  message={`Bạn đã thay đổi vượt mức quy định (tối đa 10% số lượng người tham gia)`}
                />
              )}
              {planReachMaxRestaurantQuantity && (
                <ErrorMessage
                  className={css.error}
                  message={`Bạn đã đặt vượt mức tối đa (${maxQuantity} phần)`}
                />
              )}
              {planReachMinRestaurantQuantity && (
                <ErrorMessage
                  className={css.error}
                  message={`Cần đặt tối thiểu ${minQuantity} phần`}
                />
              )}

              <Button
                variant="inline"
                className={css.addOrderButton}
                onClick={addOrderRowModalControl.setTrue}>
                <IconAdd variant="large" />

                <div>Thêm phần ăn</div>
              </Button>

              <SlideModal
                id="ManageOrdersSection.AddOrderMobileModal"
                containerClassName={css.mobileModalContainer}
                modalTitle={addOrderRowTitle}
                isOpen={addOrderRowModalControl.value}
                onClose={addOrderRowModalControl.setFalse}>
                {addOrderRowFormComponent}
              </SlideModal>
            </div>
            <div className={css.desktopSection}>
              <div className={css.addOrderTitle}>
                {addOrderRowTitle}
                {addOrderRowFormComponent}
              </div>
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
      <Tabs
        disabled={inProgress}
        items={items}
        onChange={handleDateTabChange}
        showNavigation
        shouldShowNavigatorBorder
        middleLabel
        defaultActiveKey={`${
          (defaultActiveKey < 0 ? 0 : defaultActiveKey) + 1
        }`}
      />

      <RenderWhen.False>
        <RenderWhen condition={!hasSubOrders}>
          <Skeleton className={css.rootSkeleton} />
        </RenderWhen>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default ManageOrdersSection;
