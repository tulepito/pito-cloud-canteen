/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { MORNING_SESSION } from '@components/CalendarDashboard/helpers/constant';
import { calculateGroupMembersAmount } from '@helpers/company';
import { addCommas } from '@helpers/format';
import { getRestaurantListFromOrderDetail } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  changeStep2SubmitStatus,
  orderAsyncActions,
  saveDraftEditOrder,
} from '@redux/slices/Order.slice';
import { EOrderStates, EOrderType } from '@src/utils/enums';
import { Listing, User } from '@utils/data';
import { getSelectedDaysOfWeek } from '@utils/dates';
import type { TListing, TObject } from '@utils/types';

import MealPlanSetupForm from '../../components/MealPlanSetupForm/MealPlanSetupForm';
import { EFlowType } from '../../components/NavigateButtons/NavigateButtons';

type MealPlanSetupProps = {
  goBack: () => void;
  nextTab: () => void;
  nextToReviewTab?: () => void;
  flowType?: EFlowType;
};
const MealPlanSetup: React.FC<MealPlanSetupProps> = (props) => {
  const {
    flowType = EFlowType.createOrEditDraft,
    nextTab,
    nextToReviewTab,
    goBack,
  } = props;
  const [draftEditValues, setDraftEditValues] = useState({});
  const dispatch = useAppDispatch();
  const selectedBooker = useAppSelector(
    (state) => state.Order.selectedBooker,
    shallowEqual,
  );
  const draftEditOrderDetail = useAppSelector(
    (state) => state.Order.draftEditOrderData.orderDetail,
  );
  const draftEditOrderData = useAppSelector(
    (state) => state.Order.draftEditOrderData.generalInfo,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const nutritionsOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );
  const companies = useAppSelector(
    (state) => state.company.companyRefs,
    shallowEqual,
  );

  const isEditFlow = flowType === EFlowType.edit;

  const orderMetadata = Listing(order as TListing).getMetadata();
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
    plans = [],
    orderState,
  } = orderMetadata;
  const { address, origin } = deliveryAddress || {};
  const isOrderInProgress = orderState === EOrderStates.inProgress;

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

  const {
    dayInWeek: draftDayInWeek,
    packagePerMember: draftPackagePerMember,
    vatAllow: draftVatAllow,
    pickAllow: draftPickAllow,
    selectedGroups: draftSelectGroups,
    deliveryHour: draftDeliveryHour,
    startDate: draftStartDate,
    endDate: draftEndDate,
    nutritions: draftNutritions,
    deliveryAddress: draftDeliveryAddress,
    detailAddress: draftDetailAddress,
    deadlineDate: draftDeadlineDate,
    deadlineHour: draftDeadlineHour,
    memberAmount: draftMemberAmount,
    displayedDurationTime: draftDisplayedDurationTime,
    durationTimeMode: draftDurationTimeMode,
    daySession: draftDaySession,
  } = draftEditOrderData;
  const { address: draftAddress, origin: draftOrigin } =
    draftDeliveryAddress || {};

  const allMembersAmount =
    draftMemberAmount ||
    memberAmount ||
    (currentClient &&
      calculateGroupMembersAmount(
        currentClient,
        draftSelectGroups || selectedGroups,
      ));

  const restaurantListFromOrder = Object.keys(
    getRestaurantListFromOrderDetail(
      isEditFlow
        ? isEmpty(draftEditOrderDetail)
          ? orderDetail
          : draftEditOrderDetail
        : orderDetail,
    ),
  );

  const initialValues = useMemo(
    () => ({
      vatAllow: typeof draftVatAllow !== 'undefined' ? draftVatAllow : vatAllow,
      pickAllow:
        typeof draftPickAllow !== 'undefined' ? draftPickAllow : pickAllow,
      orderType:
        typeof draftPickAllow !== 'undefined'
          ? draftPickAllow
          : pickAllow
          ? EOrderType.group
          : EOrderType.normal,
      dayInWeek:
        draftDayInWeek ||
        (!isEmpty(dayInWeek) ? dayInWeek : ['mon', 'tue', 'wed', 'thu', 'fri']),
      packagePerMember:
        addCommas((draftPackagePerMember || packagePerMember)?.toString()) ||
        '',
      selectedGroups: draftSelectGroups || selectedGroups,
      nutritions: draftNutritions || (!isEmpty(nutritions) ? nutritions : []),
      deliveryHour: draftDeliveryHour || deliveryHour || '07:00 - 07:15',
      deliveryAddress:
        draftDeliveryAddress || deliveryAddress || location
          ? {
              search: draftAddress || address || defaultAddress,
              selectedPlace: {
                address: draftAddress || address || defaultAddress,
                origin: draftOrigin || origin || defaultOrigin,
              },
            }
          : null,
      detailAddress: draftDetailAddress || detailAddress || '',
      startDate: draftStartDate || startDate || '',
      endDate: draftEndDate || endDate || '',
      deadlineDate: draftDeadlineDate || deadlineDate || null,
      deadlineHour: draftDeadlineHour || deadlineHour || '07:00',
      memberAmount: allMembersAmount,
      durationTimeMode: draftDurationTimeMode || durationTimeMode || 'week',
      displayedDurationTime:
        draftDisplayedDurationTime || displayedDurationTime || 1,
      daySession: draftDaySession || daySession || MORNING_SESSION,
    }),
    [
      JSON.stringify(location),
      JSON.stringify(orderMetadata),
      JSON.stringify(draftEditOrderData),
    ],
  );

  const handleSubmit = useCallback(
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

  const handleSaveDraft = async () => {
    const { deliveryAddress, ...restDraftValues } = draftEditValues as TObject;
    const { deliveryAddress: initDeliveryAddress, ...restInitialValues } =
      initialValues;

    if (
      !isEqual(restInitialValues, restDraftValues) ||
      (deliveryAddress?.address &&
        deliveryAddress?.address !== initDeliveryAddress?.search)
    ) {
      const generalInfo: TObject = {
        ...restDraftValues,
        deliveryAddress,
        packagePerMember: parseInt(
          restDraftValues?.packagePerMember.replace(/,/g, '') || 0,
          10,
        ),
      };
      // TODO: add recommend restaurant logic here
      const { payload: recommendOrderDetail }: any = await dispatch(
        orderAsyncActions.recommendRestaurants({
          recommendParams: {
            startDate: generalInfo.startDate,
            endDate: generalInfo.endDate,
            dayInWeek: generalInfo.dayInWeek,
            deliveryOrigin: generalInfo.deliveryAddress.origin,
            memberAmount: generalInfo.memberAmount,
            isNormalOrder: generalInfo.pickAllow
              ? EOrderType.group
              : EOrderType.normal,
            nutritions: generalInfo.nutritions || [],
            packagePerMember: generalInfo.packagePerMember,
            daySession: generalInfo.daySession,
          },
        }),
      );

      dispatch(
        saveDraftEditOrder({ generalInfo, orderDetail: recommendOrderDetail }),
      );
    }
  };

  const handleNextTabInEditMode = () => {
    handleSaveDraft();
    nextTab();
  };

  const handleNextToReviewTabInEditMode = () => {
    handleSaveDraft();
    if (nextToReviewTab) nextToReviewTab();
  };

  useEffect(() => {
    (async () => {
      if (!isEmpty(restaurantListFromOrder)) {
        await dispatch(orderAsyncActions.fetchOrderDetail(plans));
        await dispatch(
          orderAsyncActions.fetchRestaurantCoverImages({ isEditFlow }),
        );
      }
    })();
  }, [JSON.stringify(restaurantListFromOrder), isEditFlow]);

  return (
    <MealPlanSetupForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      currentClient={currentClient}
      selectedBooker={selectedBooker}
      clientId={clientId}
      nutritionsOptions={nutritionsOptions}
      flowType={flowType}
      onGoBack={goBack}
      onCompleteClick={handleNextToReviewTabInEditMode}
      setDraftEditValues={setDraftEditValues}
      isOrderInProgress={isOrderInProgress}
      onNextClick={isEditFlow ? handleNextTabInEditMode : undefined}
    />
  );
};

export default memo(MealPlanSetup);
