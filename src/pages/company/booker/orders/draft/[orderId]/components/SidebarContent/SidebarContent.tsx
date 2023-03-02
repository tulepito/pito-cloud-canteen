import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { getInitialLocationValues } from '@helpers/mapHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing, User } from '@utils/data';
import { getDaySessionFromDeliveryTime } from '@utils/dates';
import type { TListing, TUser } from '@utils/types';
import classNames from 'classnames';
import difference from 'lodash/difference';
import isEqual from 'lodash/isEqual';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

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
};

const NavigationItem: React.FC<TNavigationItemProps> = ({
  messageId,
  onOpen = () => null,
}) => {
  const handleOpenDetails = () => {
    onOpen(messageId || false);
  };

  return (
    <div className={css.navItem} onClick={handleOpenDetails}>
      <FormattedMessage id={`SidebarContent.nav.settings.${messageId}`} />
      <IconArrow direction="right" />
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

  const orderData = Listing(order);
  const companyData = User(companyAccount!);
  const { companyLocation } = companyData.getPublicData();
  const { title: orderCode } = orderData.getAttributes();
  const {
    deliveryAddress,
    deliveryHour,
    startDate,
    endDate,
    deadlineDate,
    deadlineHour,
    memberAmount,
    nutritions,
    selectedGroups,
    packagePerMember,
    vatAllow,
  } = orderData.getMetadata();
  const locationInitValues = {
    deliveryAddress: getInitialLocationValues(
      companyLocation || deliveryAddress || {},
    ),
  };

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
    deliveryHour: deliveryHour || '07:00',
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
      packagePerMember: packagePerMemberValue,
      startDate: startDateValue,
      endDate: endDateValue,
      deliveryHour: deliveryHourValue,
      nutritions: nutritionsValue,
    } = values;
    await dispatch(
      orderAsyncActions.updateOrder({
        generalInfo: {
          ...values,
        },
      }),
    );
    const { plans = [] } = Listing(order as TListing).getMetadata();
    const changedOrderDetailFactor =
      startDate !== startDateValue ||
      endDate !== endDateValue ||
      difference(nutritions, nutritionsValue).length > 0 ||
      getDaySessionFromDeliveryTime(deliveryHour) !==
        getDaySessionFromDeliveryTime(deliveryHourValue) ||
      packagePerMember !== +packagePerMemberValue.replace(/,/g, '');
    const { payload: newOrderDetail } = await dispatch(
      orderAsyncActions.recommendRestaurants(),
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
            loading={updateOrderInProgress}
          />
        );
      case 'deliveryTime':
        return (
          <DeliveryTimeForm
            initialValues={deliveryInitValues}
            onSubmit={handleSubmit}
            loading={updateOrderInProgress}
          />
        );
      case 'expiredTime':
        return (
          <ExpiredTimeForm
            deliveryTime={new Date(startDate || nextStartWeek)}
            initialValues={deadlineInitValues}
            onSubmit={handleSubmit}
            loading={updateOrderInProgress}
          />
        );
      case 'numberEmployees':
        return (
          <NumberEmployeesForm
            initialValues={numberEmployeesInitValues}
            onSubmit={handleSubmit}
            loading={updateOrderInProgress}
          />
        );
      case 'nutrition':
        return (
          <NutritionForm
            initialValues={nutritionsInitValues}
            onSubmit={handleSubmit}
            loading={updateOrderInProgress}
          />
        );
      case 'access':
        return (
          <AccessForm
            initialValues={selectedGroupsInitValues}
            onSubmit={handleSubmit}
            loading={updateOrderInProgress}
            groupList={groupList}
            companyId={companyData.getId()}
          />
        );
      case 'unitBudget':
        return (
          <UnitBudgetForm
            initialValues={packagePerMemberInitValues}
            onSubmit={handleSubmit}
            loading={updateOrderInProgress}
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
          <NavigationItem onOpen={handleOpenDetails} messageId="deliveryTime" />
          <NavigationItem onOpen={handleOpenDetails} messageId="expiredTime" />
          <NavigationItem
            onOpen={handleOpenDetails}
            messageId="numberEmployees"
          />
          <NavigationItem onOpen={handleOpenDetails} messageId="nutrition" />
          <NavigationItem onOpen={handleOpenDetails} messageId="access" />
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
