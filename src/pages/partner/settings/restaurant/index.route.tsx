/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';

import { useFetchPartnerListing } from '../hooks/useFetchPartnerListing';
import { PartnerSettingsThunks } from '../PartnerSettings.slice';

import type { TRestaurantSettingFormValues } from './components/RestaurantSettingForm';
import RestaurantSettingForm from './components/RestaurantSettingForm';
import RestaurantSettingModal from './components/RestaurantSettingModal';

const PartnerRestaurantSettingRoute = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  useFetchPartnerListing();
  const { isMobileLayout } = useViewport();
  const [formValues, setFormValues] = useState<
    TRestaurantSettingFormValues | undefined
  >(undefined);
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );
  const fetchDataInProgress = useAppSelector(
    (state) => state.PartnerSettingsPage.fetchDataInProgress,
  );
  const updateRestaurantInprogress = useAppSelector(
    (state) => state.PartnerSettingsPage.updateRestaurantInprogress,
  );
  const {
    isActive = true,
    stopReceiveOrder = false,
    startStopReceiveOrderDate,
    endStopReceiveOrderDate,
    startDayOff,
    endDayOff,
  } = Listing(restaurantListing).getPublicData();

  const stopReceiveOrderInfo = useMemo(
    () =>
      fetchDataInProgress
        ? ''
        : `${formatTimestamp(
            formValues?.startStopReceiveOrderDate || startStopReceiveOrderDate,
          )} -  ${formatTimestamp(
            formValues?.endStopReceiveOrderDate || endStopReceiveOrderDate,
          )}`,
    [
      fetchDataInProgress,
      JSON.stringify(formValues),
      startStopReceiveOrderDate,
      endStopReceiveOrderDate,
    ],
  );
  const dayOffInfo = useMemo(
    () =>
      fetchDataInProgress
        ? ''
        : `${formatTimestamp(
            formValues?.startDayOff || startDayOff,
          )} -  ${formatTimestamp(formValues?.endDayOff || endDayOff)}`,
    [fetchDataInProgress, JSON.stringify(formValues), startDayOff, endDayOff],
  );

  const formInitialValues = useMemo(
    () => ({
      isActive:
        typeof formValues?.isActive !== 'undefined'
          ? formValues?.isActive
          : isActive,
      dayOffInfo,
      stopReceiveOrder:
        typeof formValues?.stopReceiveOrder !== 'undefined'
          ? formValues?.stopReceiveOrder
          : stopReceiveOrder,
      stopReceiveOrderInfo,
      startStopReceiveOrderDate:
        formValues?.startStopReceiveOrderDate || startStopReceiveOrderDate,
      endStopReceiveOrderDate:
        formValues?.endStopReceiveOrderDate || endStopReceiveOrderDate,
      startDayOff: formValues?.startDayOff || startDayOff,
      endDayOff: formValues?.endDayOff || endDayOff,
    }),
    [
      isActive,
      dayOffInfo,
      stopReceiveOrder,
      stopReceiveOrderInfo,
      startStopReceiveOrderDate,
      endStopReceiveOrderDate,
      startDayOff,
      endDayOff,
      JSON.stringify(formValues),
    ],
  );

  const disabledSubmitOnDesktopFlow =
    typeof formValues === 'undefined' ||
    (formValues.isActive === isActive &&
      formValues.stopReceiveOrder === stopReceiveOrder &&
      formValues.startStopReceiveOrderDate === startStopReceiveOrderDate &&
      formValues.endStopReceiveOrderDate === endStopReceiveOrderDate &&
      formValues.startDayOff === startDayOff &&
      formValues.endDayOff === endDayOff);
  const handleClose = () => {
    router.push(partnerPaths.Settings);
  };

  const handleSubmit = async (values: TRestaurantSettingFormValues) => {
    const { isActive: isActiveFromForm, ...restValues } = values;

    if (
      typeof isActiveFromForm !== 'undefined' &&
      isActiveFromForm !== isActive
    ) {
      dispatch(PartnerSettingsThunks.toggleRestaurantActiveStatus());
    }

    dispatch(PartnerSettingsThunks.updatePartnerRestaurantListing(restValues));
  };

  return (
    <MetaWrapper routeName="PartnerRestaurantSettingRoute">
      <RenderWhen condition={isMobileLayout}>
        <RestaurantSettingModal
          isOpen
          initialValues={formInitialValues}
          onClose={handleClose}
        />
        <RenderWhen.False>
          <RestaurantSettingForm
            onSubmit={handleSubmit}
            initialValues={formInitialValues}
            setFormValues={setFormValues}
            inProgress={updateRestaurantInprogress}
            disabledSubmitOnDesktopFlow={disabledSubmitOnDesktopFlow}
          />
        </RenderWhen.False>
      </RenderWhen>
    </MetaWrapper>
  );
};

export default PartnerRestaurantSettingRoute;
