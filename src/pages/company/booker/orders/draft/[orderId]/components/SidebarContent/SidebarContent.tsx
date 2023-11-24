import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import difference from 'lodash/difference';
import isEqual from 'lodash/isEqual';
import { DateTime } from 'luxon';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { getInitialLocationValues } from '@helpers/mapHelpers';
import {
  findMinDeadlineDate,
  findMinStartDate,
  mealTypeAdapter,
  mealTypeReverseAdapter,
} from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { EOrderType } from '@src/utils/enums';
import { Listing, User } from '@utils/data';
import { getDaySessionFromDeliveryTime } from '@utils/dates';
import type { TListing, TUser } from '@utils/types';

import AccessForm from '../../forms/AccessForm/AccessForm';
import DeliveryTimeForm from '../../forms/DeliveryTimeForm/DeliveryTimeForm';
import ExpiredTimeForm from '../../forms/ExpiredTimeForm/ExpiredTimeForm';
import LocationForm from '../../forms/LocationForm/LocationForm';
import NumberEmployeesForm from '../../forms/NumberEmployeesForm/NumberEmployeesForm';
import NutritionForm from '../../forms/NutritionForm/NutritionForm';
import UnitBudgetForm from '../../forms/UnitBudgetForm/UnitBudgetForm';

import css from './SidebarContent.module.scss';

type TSidebarContentProps = {
  className?: string;
  order?: any;
  companyAccount: TUser | null;
};

type TNavigationItemProps = {
  messageId?: string;
  onOpen?: (id: string | boolean) => void;
  errorMessage?: string;
};

const NavigationItem: React.FC<TNavigationItemProps> = ({
  messageId,
  onOpen = () => null,
  errorMessage = '',
}) => {
  const handleOpenDetails = () => {
    onOpen(messageId || false);
  };

  return (
    <div className={css.navItem} onClick={handleOpenDetails}>
      <div className={css.itemContainer}>
        <FormattedMessage id={`SidebarContent.nav.settings.${messageId}`} />
        <IconArrow direction="right" />
      </div>

      <RenderWhen condition={!!errorMessage}>
        <div className={css.errorMessage}>{errorMessage}</div>
      </RenderWhen>
    </div>
  );
};

const SidebarContent: React.FC<TSidebarContentProps> = ({
  className,
  order,
  companyAccount,
}) => {
  const classes = classNames(css.root, className);

  const [isOpenDetails, setIsOpenDetails] = useState<string | boolean>(false);
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );

  const recommendRestaurantInProgress = useAppSelector(
    (state) => state.Order.recommendRestaurantInProgress,
  );
  const orderData = Listing(order);
  const companyData = User(companyAccount!);
  const { title: orderCode } = orderData.getAttributes();
  const {
    deliveryAddress,
    deliveryHour,
    startDate = 0,
    endDate,
    deadlineDate,
    deadlineHour,
    memberAmount,
    nutritions,
    mealType = [],
    selectedGroups,
    packagePerMember,
    vatAllow,
    orderType = EOrderType.group,
  } = orderData.getMetadata();
  const locationInitValues = {
    deliveryAddress: getInitialLocationValues(
      deliveryAddress?.address !== null ? deliveryAddress : {},
    ),
  };
  const isGroupOrder = orderType === EOrderType.group;
  const isStartDateInValid = startDate < findMinStartDate().getTime();
  const isDeadlineDateInValid = deadlineDate < findMinDeadlineDate().getTime();
  const sidebarFormSubmitInProgress =
    updateOrderInProgress ||
    updateOrderDetailInProgress ||
    recommendRestaurantInProgress;

  const nextStartWeek = DateTime.fromJSDate(new Date())
    .startOf('week')
    .startOf('day')
    .plus({ days: 7 })
    .toMillis();
  const nextEndWeek = DateTime.fromJSDate(new Date())
    .endOf('week')
    .endOf('day')
    .plus({ days: 7 })
    .toMillis();
  const defaultDeadlineDate = DateTime.fromMillis(startDate || nextStartWeek)
    .minus({ days: 2 })
    .toMillis();

  const groupList = companyData.getMetadata().groups;

  const deliveryInitValues = {
    startDate: startDate || nextStartWeek,
    endDate: endDate || nextEndWeek,
    deliveryHour,
  };
  const deadlineInitValues = {
    deadlineDate: new Date(deadlineDate).getTime() || defaultDeadlineDate,
    deadlineHour: deadlineHour || '07:00',
  };
  const numberEmployeesInitValues = {
    memberAmount,
  };
  const nutritionsInitValues = {
    nutritions: nutritions || [],
    mealType: mealType
      ? mealType.map((_type: string) => mealTypeAdapter(_type))
      : [],
  };
  const selectedGroupsInitValues = {
    selectedGroups,
  };
  const packagePerMemberInitValues = {
    packagePerMember,
    vatAllow,
  };
  const dispatch = useAppDispatch();

  const handleOpenDetails = (id: string | boolean) => {
    setIsOpenDetails(id);
  };

  const handleCloseDetails = () => {
    setIsOpenDetails(false);
  };

  const handleSubmit = async (values: any) => {
    const {
      packagePerMember: packagePerMemberValue = '',
      startDate: startDateValue,
      endDate: endDateValue,
      deliveryHour: deliveryHourValue,
      nutritions: nutritionsValue,
      mealType: mealTypeValue,
      memberAmount: memberAmountValue,
    } = values;
    const finalStartDate = startDateValue || startDate;
    const finalEndDate = endDateValue || endDate;
    await dispatch(
      orderAsyncActions.updateOrder({
        generalInfo: {
          ...values,
          mealType: mealTypeValue?.map((type: any) =>
            mealTypeReverseAdapter(type),
          ),
          ...(startDate !== finalStartDate && {
            deadlineDate: DateTime.fromMillis(finalStartDate)
              .minus({ days: 3 })
              .toMillis(),
          }),
        },
      }),
    );
    const { plans = [] } = Listing(order as TListing).getMetadata();
    const finalPackagePerMember = packagePerMemberValue || packagePerMember;

    const finalDeliveryHour = deliveryHourValue || deliveryHour;
    const finalNutritions = nutritionsValue || nutritions;
    const changedOrderDetailFactor =
      startDate !== finalStartDate ||
      endDate !== finalEndDate ||
      difference(nutritions, finalNutritions).length > 0 ||
      getDaySessionFromDeliveryTime(deliveryHour.split('-')[0]) !==
        getDaySessionFromDeliveryTime(finalDeliveryHour) ||
      packagePerMember !== +finalPackagePerMember ||
      memberAmount !== +memberAmountValue;

    const { payload: newOrderDetail } = await dispatch(
      orderAsyncActions.recommendRestaurants({}),
    );

    if (!isEqual(orderDetail, newOrderDetail) && changedOrderDetailFactor) {
      const planId = plans[0];
      await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId: Listing(order as TListing).getId(),
          orderDetail: newOrderDetail,
          planId,
        }),
      );
    }
  };

  const renderForm = () => {
    switch (isOpenDetails) {
      case 'location':
        return (
          <LocationForm
            initialValues={locationInitValues}
            onSubmit={handleSubmit}
            loading={sidebarFormSubmitInProgress}
          />
        );
      case 'deliveryTime':
        return (
          <DeliveryTimeForm
            initialValues={deliveryInitValues}
            onSubmit={handleSubmit}
            loading={sidebarFormSubmitInProgress}
          />
        );
      case 'expiredTime':
        return (
          <ExpiredTimeForm
            deliveryTime={new Date(startDate || nextStartWeek)}
            initialValues={deadlineInitValues}
            onSubmit={handleSubmit}
            loading={sidebarFormSubmitInProgress}
          />
        );
      case 'numberEmployees':
        return (
          <NumberEmployeesForm
            initialValues={numberEmployeesInitValues}
            onSubmit={handleSubmit}
            loading={sidebarFormSubmitInProgress}
          />
        );
      case 'nutrition':
        return (
          <NutritionForm
            initialValues={nutritionsInitValues}
            onSubmit={handleSubmit}
            loading={sidebarFormSubmitInProgress}
          />
        );
      case 'access':
        return (
          <AccessForm
            initialValues={selectedGroupsInitValues}
            onSubmit={handleSubmit}
            loading={sidebarFormSubmitInProgress}
            groupList={groupList}
            companyId={companyData.getId()}
          />
        );
      case 'unitBudget':
        return (
          <UnitBudgetForm
            initialValues={packagePerMemberInitValues}
            onSubmit={handleSubmit}
            loading={sidebarFormSubmitInProgress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes}>
      <div
        className={classNames(css.main, {
          [css.hideMain]: isOpenDetails,
        })}>
        <div className={css.header}>
          <h2 className={css.title}>#{orderCode}</h2>
          <Badge
            label="Đơn hàng tuần"
            type={EBadgeType.info}
            className={css.badge}
          />
        </div>
        <nav className={css.navigation}>
          <NavigationItem onOpen={handleOpenDetails} messageId="location" />
          <NavigationItem
            onOpen={handleOpenDetails}
            messageId="deliveryTime"
            errorMessage={isStartDateInValid ? 'Thời gian không hợp lệ' : ''}
          />
          <RenderWhen condition={isGroupOrder}>
            <NavigationItem
              onOpen={handleOpenDetails}
              messageId="expiredTime"
              errorMessage={
                isDeadlineDateInValid ? 'Thời gian không hợp lệ' : ''
              }
            />
          </RenderWhen>
          <NavigationItem
            onOpen={handleOpenDetails}
            messageId="numberEmployees"
          />
          <NavigationItem onOpen={handleOpenDetails} messageId="nutrition" />
          <RenderWhen condition={isGroupOrder}>
            <NavigationItem onOpen={handleOpenDetails} messageId="access" />
          </RenderWhen>

          <NavigationItem onOpen={handleOpenDetails} messageId="unitBudget" />
        </nav>
      </div>

      <div
        className={classNames(css.detailContent, {
          [css.showDetailContent]: isOpenDetails,
        })}>
        <div className={css.goBack}>
          <span className={css.goBackClickArea} onClick={handleCloseDetails}>
            <IconArrow className={css.iconBack} direction="left" />
            <FormattedMessage id="SidebarContent.details.goBack" />
          </span>
        </div>
        <div className={css.detailsTitle}>
          {isOpenDetails && (
            <FormattedMessage
              id={`SidebarContent.nav.settings.${isOpenDetails}`}
            />
          )}
        </div>
        <div className={css.detailsForm}>{renderForm()}</div>
      </div>
    </div>
  );
};

export default SidebarContent;
