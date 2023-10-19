import React, { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { CurrentUser, IntegrationListing } from '@utils/data';
import { EFoodType, EMenuType } from '@utils/enums';
import { getInitialAddImages } from '@utils/images';
import type { TObject } from '@utils/types';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import {
  partnerFoodSliceActions,
  partnerFoodSliceThunks,
} from '../PartnerFood.slice';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getDuplicateData, getSubmitFoodData } from '../utils';

import css from './CreatePartnerFood.module.scss';

const CreatePartnerFoodPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { duplicateId } = router.query;
  const {
    createFoodInProgress,
    createFoodError,
    currentFoodListing,
    showFoodInProgress,
    showFoodError,
    uploadingImages,
  } = useAppSelector((state) => state.PartnerFood, shallowEqual);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = CurrentUser(currentUser!);
  const { restaurantListingId } = currentUserGetter.getMetadata();

  const {
    partnerListingRef,
    showPartnerListingInProgress,
    showPartnerListingError,
  } = useAppSelector((state) => state.partners, shallowEqual);

  const handleSubmit = async (values: TEditPartnerFoodFormValues) => {
    if (duplicateId) {
      const response = await dispatch(
        partnerFoodSliceThunks.duplicateFood(
          getDuplicateData({
            ...values,
            restaurantId: restaurantListingId,
          }),
        ),
      );

      return response;
    }
    const response = await dispatch(
      partnerFoodSliceThunks.createPartnerFoodListing(
        getSubmitFoodData({
          ...values,
          restaurantId: restaurantListingId,
        }),
      ),
    );

    return response;
  };

  const { minQuantity, maxQuantity } =
    IntegrationListing(partnerListingRef).getPublicData();

  const initialValues = useMemo(() => {
    const attributes = currentFoodListing?.attributes || {};
    const {
      publicData = {},
      price,
      title,
      description,
    } = attributes || ({} as TObject);
    const { foodType, menuType, allergicIngredients, ...rest } = publicData;

    return {
      images: getInitialAddImages(currentFoodListing?.images || []),
      title,
      description,
      price: price?.amount,
      menuType: menuType || EMenuType.cycleMenu,
      foodType: foodType || EFoodType.savoryDish,
      minOrderHourInAdvance: 24,
      minQuantity,
      maxQuantity,
      allergicIngredients: allergicIngredients || [],
      ...rest,
    };
  }, [
    currentFoodListing,
    minQuantity,
    maxQuantity,
  ]) as TEditPartnerFoodFormValues;

  useEffect(() => {
    if (!duplicateId) {
      dispatch(partnerFoodSliceActions.setInitialStates());
    }
  }, [duplicateId, dispatch]);

  useEffect(() => {
    if (!duplicateId) return;
    dispatch(partnerFoodSliceThunks.showDuplicateFood(duplicateId));
  }, [duplicateId, dispatch]);

  if (showFoodInProgress || showPartnerListingInProgress) {
    return <LoadingContainer />;
  }

  const showError = showPartnerListingError || showFoodError;

  if (showError) {
    return <ErrorMessage message={showError.message} />;
  }

  return (
    <>
      <h3 className={css.title}>
        <FormattedMessage id="CreatePartnerFood.title" />
      </h3>
      <EditPartnerFoodForm
        onSubmit={handleSubmit}
        initialValues={initialValues}
        inProgress={createFoodInProgress}
        disabled={uploadingImages || createFoodInProgress}
        formError={createFoodError}
      />
    </>
  );
};

export default CreatePartnerFoodPage;
