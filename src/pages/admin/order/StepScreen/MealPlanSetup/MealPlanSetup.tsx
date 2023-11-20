/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { MORNING_SESSION } from '@components/CalendarDashboard/helpers/constant';
import AlertModal from '@components/Modal/AlertModal';
import { calculateGroupMembersAmount } from '@helpers/company';
import { addCommas } from '@helpers/format';
import { getRestaurantListFromOrderDetail } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  changeStep2SubmitStatus,
  orderAsyncActions,
  saveDraftEditOrder,
} from '@redux/slices/Order.slice';
import { EOrderDraftStates, EOrderStates, EOrderType } from '@src/utils/enums';
import { Listing, User } from '@utils/data';
import { getSelectedDaysOfWeek } from '@utils/dates';
import type { TListing, TObject } from '@utils/types';

import MealPlanSetupForm from '../../components/MealPlanSetupForm/MealPlanSetupForm';
import NavigateButtons, {
  EFlowType,
} from '../../components/NavigateButtons/NavigateButtons';
import {
  isMealPlanSetupDataValid,
  prepareOrderDetailFromOldOrderDetail,
} from '../../edit/[orderId]/components/EditOrderWizard/EditOrderWizard.helper';
import { checkDeliveryHourIsMatchedWithAllRestaurants } from '../../helpers/editOrder';

type MealPlanSetupProps = {
  goBack: () => void;
  nextTab: () => void;
  nextToReviewTab?: () => void;
  flowType?: EFlowType;
  shouldDisableFields?: boolean;
  draftEditValues?: TObject;
  setDraftEditValues?: (value: any) => void;
};
const MealPlanSetup: React.FC<MealPlanSetupProps> = (props) => {
  const {
    flowType = EFlowType.createOrEditDraft,
    nextTab,
    nextToReviewTab,
    goBack,
    shouldDisableFields = false,
    draftEditValues = {},
    setDraftEditValues,
  } = props;
  const formSubmitRef = useRef<any>();
  const shouldNextTabControl = useBoolean();
  const confirmRcmRestaurantControl = useBoolean();
  const [deliveryHourNotMatchError, setDeliveryHourNotMatchError] =
    useState<string>('');
  const dispatch = useAppDispatch();
  const step2SubmitInProgress = useAppSelector(
    (state) => state.Order.step2SubmitInProgress,
  );
  const recommendRestaurantInProgress = useAppSelector(
    (state) => state.Order.recommendRestaurantInProgress,
  );
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
  const restaurantListings = useAppSelector(
    (state) => state.Order.restaurantListings,
  );

  const isEditFlow = flowType === EFlowType.edit;
  const orderMetadata = Listing(order as TListing).getMetadata();
  const {
    companyId: clientId,
    dayInWeek,
    packagePerMember = '',
    vatAllow = true,
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
    orderState = EOrderDraftStates.pendingApproval,
    orderType = EOrderType.group,
  } = orderMetadata;
  const isGroupOrder = orderType === EOrderType.group;
  const { address, origin } = deliveryAddress || {};

  const isPendingBookerApprovalOrder =
    orderState === EOrderDraftStates.pendingApproval;
  const isOrderInProgress = orderState === EOrderStates.inProgress;
  const isEditInprogressOrder = isEditFlow && isOrderInProgress;
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
  } = draftEditOrderData || {};
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

  const shouldDisableNextTab =
    isEditFlow &&
    isPendingBookerApprovalOrder &&
    !isMealPlanSetupDataValid(draftEditValues);

  const restaurantListFromOrder = useMemo(
    () =>
      Object.keys(
        getRestaurantListFromOrderDetail(
          isEditFlow
            ? isEmpty(draftEditOrderDetail)
              ? orderDetail
              : draftEditOrderDetail
            : orderDetail,
        ),
      ),
    [
      isEditFlow,
      JSON.stringify(orderDetail),
      JSON.stringify(draftEditOrderDetail),
    ],
  );

  const initialValues = useMemo(
    () => ({
      vatAllow: typeof draftVatAllow !== 'undefined' ? draftVatAllow : vatAllow,
      pickAllow:
        typeof draftPickAllow !== 'undefined' ? draftPickAllow : isGroupOrder,
      orderType: (
        typeof draftPickAllow !== 'undefined' ? draftPickAllow : isGroupOrder
      )
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

  const handleNextTabOrNextReviewTab = (shouldNext = false) => {
    if (shouldNextTabControl.value || shouldNext) {
      nextTab();
    } else if (nextToReviewTab) nextToReviewTab();
  };

  const handleSubmitSaveDraft = async (shouldNext = false) => {
    const { deliveryAddress, ...restDraftValues } = draftEditValues as TObject;
    const { deliveryAddress: initDeliveryAddress, ...restInitialValues } =
      initialValues;
    const isAddressChanged =
      deliveryAddress?.address &&
      deliveryAddress.address !== initDeliveryAddress?.search;
    if (isEditInprogressOrder) {
      const {
        detailAddress: draftDetailAddress,
        deliveryHour: draftDeliveryHour,
      } = restDraftValues || {};

      const isDeliveryHourMatchingRestaurantOpenTime =
        checkDeliveryHourIsMatchedWithAllRestaurants({
          deliveryHour: draftDeliveryHour,
          restaurantListings,
          dayInWeek,
        });
      if (isDeliveryHourMatchingRestaurantOpenTime) {
        dispatch(
          saveDraftEditOrder({
            generalInfo: {
              ...(deliveryAddress && { deliveryAddress }),
              ...(draftDetailAddress && { detailAddress: draftDetailAddress }),
              ...(draftDeliveryHour && { deliveryHour: draftDeliveryHour }),
            },
          }),
        );
        handleNextTabOrNextReviewTab(shouldNext);
      } else {
        setDeliveryHourNotMatchError(
          'Thời gian giao hàng bạn chọn không phù hợp với thời gian phục vụ của nhà hàng',
        );
      }
    } else if (
      !isEqual(restInitialValues, restDraftValues) ||
      isAddressChanged
    ) {
      const generalInfo: TObject = {
        ...restDraftValues,
        deliveryAddress,
        packagePerMember: parseInt(
          restDraftValues?.packagePerMember.replace(/,/g, '') || 0,
          10,
        ),
      };
      dispatch(saveDraftEditOrder({ generalInfo }));

      if (isPendingBookerApprovalOrder) {
        confirmRcmRestaurantControl.setTrue();
      } else {
        // TODO: auto run recommend with others states
        const { payload: recommendOrderDetail }: any = await dispatch(
          orderAsyncActions.recommendRestaurants({
            recommendParams: {
              startDate: generalInfo.startDate,
              endDate: generalInfo.endDate,
              dayInWeek: generalInfo.dayInWeek,
              deliveryOrigin: generalInfo.deliveryAddress.origin,
              memberAmount: generalInfo.memberAmount,
              isNormalOrder: !generalInfo.pickAllow,
              nutritions: generalInfo.nutritions || [],
              packagePerMember: generalInfo.packagePerMember,
              daySession: generalInfo.daySession,
            },
          }),
        );

        dispatch(
          saveDraftEditOrder({
            generalInfo,
            orderDetail: recommendOrderDetail,
          }),
        );
      }
    } else {
      handleNextTabOrNextReviewTab(shouldNext);
    }
  };

  const handleConfirmRecommendRestaurant = async () => {
    const { payload: recommendOrderDetail }: any = await dispatch(
      orderAsyncActions.recommendRestaurants({
        recommendParams: {
          startDate: draftEditOrderData.startDate,
          endDate: draftEditOrderData.endDate,
          dayInWeek: draftEditOrderData.dayInWeek,
          deliveryOrigin: draftEditOrderData.deliveryAddress.origin,
          memberAmount: draftEditOrderData.memberAmount,
          isNormalOrder: !draftEditOrderData.pickAllow,
          nutritions: draftEditOrderData.nutritions || [],
          packagePerMember: draftEditOrderData.packagePerMember,
          daySession: draftEditOrderData.daySession,
        },
      }),
    );

    dispatch(saveDraftEditOrder({ orderDetail: recommendOrderDetail }));
    confirmRcmRestaurantControl.setFalse();
    handleNextTabOrNextReviewTab();
  };

  const handleCloseConfirmRcmRestaurantModal = () => {
    confirmRcmRestaurantControl.setFalse();
    dispatch(
      saveDraftEditOrder({
        orderDetail: prepareOrderDetailFromOldOrderDetail({
          orderDetail,
          startDate: draftEditOrderData.startDate,
          endDate: draftEditOrderData.endDate,
        }),
      }),
    );

    handleNextTabOrNextReviewTab();
  };

  const handleSubmit = async (values: any) => {
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
      ...rest,
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
  };

  const handleCreateFlowSubmitClick = async () => {
    await formSubmitRef?.current();
  };

  const handleNextTabInEditMode = () => {
    shouldNextTabControl.setTrue();
    handleSubmitSaveDraft(true);
  };

  const handleNextToReviewTabInEditMode = () => {
    handleSubmitSaveDraft();
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
    <>
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
        setDraftEditValues={setDraftEditValues!}
        formSubmitRef={formSubmitRef}
        shouldDisableFields={shouldDisableFields}
        isOrderInProgress={isOrderInProgress}
        deliveryHourNotMatchError={deliveryHourNotMatchError}
      />
      <NavigateButtons
        flowType={flowType}
        onNextClick={
          isEditFlow ? handleNextTabInEditMode : handleCreateFlowSubmitClick
        }
        goBack={goBack}
        onCompleteClick={handleNextToReviewTabInEditMode}
        inProgress={step2SubmitInProgress}
        nextDisabled={shouldDisableNextTab}
        submitDisabled={shouldDisableNextTab}
      />

      <AlertModal
        isOpen={confirmRcmRestaurantControl.value}
        handleClose={handleCloseConfirmRcmRestaurantModal}
        onCancel={handleCloseConfirmRcmRestaurantModal}
        cancelDisabled={recommendRestaurantInProgress}
        onConfirm={handleConfirmRecommendRestaurant}
        confirmInProgress={recommendRestaurantInProgress}
        confirmDisabled={recommendRestaurantInProgress}
        title={'Thiết lập kế hoạch bữa ăn mới'}
        confirmLabel="Có"
        cancelLabel="Không">
        Bạn có muốn thiết lập kế hoạch bữa ăn mới không?
      </AlertModal>
    </>
  );
};

export default memo(MealPlanSetup);
