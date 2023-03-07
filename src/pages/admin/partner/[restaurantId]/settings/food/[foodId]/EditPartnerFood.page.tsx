import React, { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceAction, foodSliceThunks } from '@redux/slices/foods.slice';
import { IntegrationListing } from '@src/utils/data';
import type { TObject } from '@src/utils/types';
import { EFoodTypes, EMenuTypes } from '@utils/enums';
import { getInitialAddImages } from '@utils/images';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getUpdateFoodData } from '../utils';

import css from './EditPartnerFood.module.scss';

const EditPartnerFoodPage = () => {
  const { foodId = '' } = useRouter().query;
  const dispatch = useAppDispatch();

  const {
    currentFoodListing,
    showFoodInProgress,
    showFoodError,
    updateFoodInProgress,
    updateFoodError,
    uploadingImages,
  } = useAppSelector((state) => state.foods, shallowEqual);

  const {
    partnerListingRef,
    showPartnerListingInProgress,
    showPartnerListingError,
  } = useAppSelector((state) => state.partners, shallowEqual);

  const { packaging } = IntegrationListing(partnerListingRef).getPublicData();

  const handleSubmit = (values: TEditPartnerFoodFormValues) =>
    dispatch(
      foodSliceThunks.updatePartnerFoodListing(
        getUpdateFoodData({ ...values, id: foodId as string }),
      ),
    );
  const initialValues = useMemo(() => {
    const attributes = currentFoodListing?.attributes || {};
    const {
      publicData = {},
      price,
      title,
      description,
    } = attributes || ({} as TObject);
    const { menuType, foodType } = publicData;
    return {
      images: getInitialAddImages(currentFoodListing?.images || []),
      title,
      description,
      price: price?.amount,
      ...publicData,
      menuType: menuType || EMenuTypes.fixedMenu,
      foodType: foodType || EFoodTypes.savoryDish,
    };
  }, [currentFoodListing]) as TEditPartnerFoodFormValues;

  useEffect(() => {
    dispatch(foodSliceAction.setInitialStates());
  }, []);

  useEffect(() => {
    if (!foodId) return;
    dispatch(foodSliceThunks.showPartnerFoodListing(foodId));
  }, [dispatch, foodId]);

  if (showFoodInProgress || showPartnerListingInProgress) {
    return <LoadingContainer />;
  }

  const showError = showFoodError || showPartnerListingError;

  if (showError) {
    return <ErrorMessage message={showError.message} />;
  }

  return (
    <>
      <h3 className={css.title}>
        <FormattedMessage id="EditPartnerFood.title" />
      </h3>
      <EditPartnerFoodForm
        onSubmit={handleSubmit}
        inProgress={updateFoodInProgress}
        disabled={uploadingImages || updateFoodInProgress}
        formError={updateFoodError}
        initialValues={initialValues}
        isEditting
        partnerPackagingList={packaging}
      />
    </>
  );
};

export default EditPartnerFoodPage;
