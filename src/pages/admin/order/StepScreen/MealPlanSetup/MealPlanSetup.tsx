/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useCallback, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import { MORNING_SESSION } from '@components/CalendarDashboard/helpers/constant';
import { calculateGroupMembersAmount } from '@helpers/company';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  changeStep2SubmitStatus,
  orderAsyncActions,
} from '@redux/slices/Order.slice';
import { EOrderType } from '@src/utils/enums';
import { Listing, User } from '@utils/data';
import { getSelectedDaysOfWeek } from '@utils/dates';
import type { TListing } from '@utils/types';

// eslint-disable-next-line import/no-cycle
import MealPlanSetupForm from '../../components/MealPlanSetupForm/MealPlanSetupForm';

type MealPlanSetupProps = {
  goBack: () => void;
  nextTab: () => void;
};
const MealPlanSetup: React.FC<MealPlanSetupProps> = (props) => {
  const { nextTab } = props;

  const dispatch = useAppDispatch();
  const selectedBooker = useAppSelector(
    (state) => state.Order.selectedBooker,
    shallowEqual,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const nutritionsOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );

  const {
    companyId: clientId,
    dayInWeek,
    packagePerMember = '',
    vatAllow = true,
    pickAllow = true,
    selectedGroups = ['allMembers'],
    deliveryHour,
    startDate,
    endDate,
    nutritions = [],
    deliveryAddress,
    detailAddress,
    deadlineDate,
    deadlineHour,
    memberAmount,
    displayedDurationTime,
    durationTimeMode,
    daySession,
  } = Listing(order as TListing).getMetadata();
  const { address, origin } = deliveryAddress || {};
  const companies = useAppSelector(
    (state) => state.company.companyRefs,
    shallowEqual,
  );
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );

  const {
    companyLocation: {
      address: defaultAddress = '',
      origin: defaultOrigin = {},
    } = {},
    companyLocation: location,
  } = User(currentClient).getPublicData();

  const onSubmit = useCallback(
    async (values: any) => {
      const {
        deliveryAddress: deliveryAddressValues,
        packagePerMember: packagePerMemberValue,
        pickAllow: pickAllowSubmitValue,
        deadlineDate: deadlineDateSubmitValue,
        deadlineHour: deadlineHourSubmitValue,
        selectedGroups: selectedGroupsSubmitValue,
        ...rest
      } = values;
      const {
        selectedPlace: { address: addressValue, origin: originValue },
      } = deliveryAddressValues;
      const selectedDayInWeek = getSelectedDaysOfWeek(
        values.startDate,
        values.endDate,
        values.dayInWeek,
      );
      const generalInfo = {
        deliveryAddress: {
          address: addressValue,
          origin: originValue,
        },
        orderType: pickAllowSubmitValue ? EOrderType.group : EOrderType.normal,
        packagePerMember: parseInt(
          packagePerMemberValue?.replace(/,/g, '') || 0,
          10,
        ),
        selectedGroups: pickAllowSubmitValue ? selectedGroupsSubmitValue : [],
        deadlineDate: pickAllowSubmitValue ? deadlineDateSubmitValue : null,
        deadlineHour: pickAllowSubmitValue ? deadlineHourSubmitValue : null,
        ...rest,
        dayInWeek: selectedDayInWeek,
      };
      dispatch(changeStep2SubmitStatus(true));
      const { payload }: { payload: any } = await dispatch(
        orderAsyncActions.updateOrder({ generalInfo }),
      );
      const { orderListing } = payload || {};
      const orderId = Listing(orderListing as TListing).getId();
      const { plans = [] } = Listing(orderListing as TListing).getMetadata();
      const planId = plans[0];
      const { payload: recommendOrderDetail }: any = await dispatch(
        orderAsyncActions.recommendRestaurants({}),
      );
      await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId,
          orderDetail: recommendOrderDetail,
        }),
      );
      dispatch(changeStep2SubmitStatus(false));
      nextTab();
    },
    [dispatch, nextTab],
  );
  const allMembersAmount =
    memberAmount ||
    (currentClient &&
      calculateGroupMembersAmount(currentClient, selectedGroups));

  const initialValues = useMemo(
    () => ({
      vatAllow,
      pickAllow,
      dayInWeek: !isEmpty(dayInWeek)
        ? dayInWeek
        : ['mon', 'tue', 'wed', 'thu', 'fri'],
      packagePerMember: addCommas(packagePerMember?.toString()) || '',
      selectedGroups,
      nutritions: !isEmpty(nutritions) ? nutritions : [],
      deliveryHour: deliveryHour || '07:00 - 07:15',
      deliveryAddress:
        location || deliveryAddress
          ? {
              search: address || defaultAddress,
              selectedPlace: {
                address: address || defaultAddress,
                origin: origin || defaultOrigin,
              },
            }
          : null,
      detailAddress: detailAddress || '',
      startDate: startDate || '',
      endDate: endDate || '',
      deadlineDate: deadlineDate || null,
      deadlineHour: deadlineHour || '07:00',
      memberAmount: allMembersAmount,
      durationTimeMode: durationTimeMode || 'week',
      displayedDurationTime: displayedDurationTime || 1,
      daySession: daySession || MORNING_SESSION,
    }),
    [
      JSON.stringify(dayInWeek),
      JSON.stringify(packagePerMember),
      vatAllow,
      pickAllow,
      JSON.stringify(nutritions),
      JSON.stringify(selectedGroups),
      deliveryHour,
      JSON.stringify(location),
      JSON.stringify(deliveryAddress),
      JSON.stringify(defaultAddress),
      JSON.stringify(detailAddress),
      JSON.stringify(address),
      JSON.stringify(defaultOrigin),
      JSON.stringify(origin),
      startDate,
      endDate,
      JSON.stringify(deadlineDate),
      deadlineHour,
      allMembersAmount,
      displayedDurationTime,
      durationTimeMode,
    ],
  );

  return (
    <MealPlanSetupForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      currentClient={currentClient}
      selectedBooker={selectedBooker}
      clientId={clientId}
      nutritionsOptions={nutritionsOptions}
    />
  );
};

export default memo(MealPlanSetup);
