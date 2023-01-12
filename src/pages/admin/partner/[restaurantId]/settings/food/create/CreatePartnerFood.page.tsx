import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceAction, foodSliceThunks } from '@redux/slices/foods.slice';
import { EFoodTypes, FIXED_MENU_KEY } from '@utils/enums';
import { getInitialAddImages } from '@utils/images';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getDuplicateData, getSubmitFoodData } from '../utils';

const CreatePartnerFoodPage = () => {
  const dispatch = useAppDispatch();
  const { restaurantId = '', duplicateId } = useRouter().query;
  const {
    createFoodInProgress,
    createFoodError,
    currentFoodListing,
    showFoodInProgress,
    showFoodError,
  } = useAppSelector((state) => state.foods, shallowEqual);
  const handleSubmit = (values: TEditPartnerFoodFormValues) => {
    if (duplicateId) {
      return dispatch(
        foodSliceThunks.duplicateFood(
          getDuplicateData({
            ...values,
            restaurantId: restaurantId as string,
          }),
        ),
      );
    }
    return dispatch(
      foodSliceThunks.createPartnerFoodListing(
        getSubmitFoodData({
          ...values,
          restaurantId: restaurantId as string,
        }),
      ),
    );
  };

  const initialValues = useMemo(() => {
    const attributes = currentFoodListing?.attributes || {};
    const { publicData = {}, price, title, description } = attributes || {};
    const { foodType, menuType, ...rest } = publicData;
    return {
      images: getInitialAddImages(currentFoodListing?.images || []),
      title,
      description,
      price: price?.amount,
      menuType: menuType || FIXED_MENU_KEY,
      foodType: foodType || EFoodTypes.vegetarianDish,
      ...rest,
    };
  }, [currentFoodListing]) as TEditPartnerFoodFormValues;

  useEffect(() => {
    if (!duplicateId) {
      dispatch(foodSliceAction.setInitialStates());
    }
  }, [duplicateId]);

  useEffect(() => {
    if (!duplicateId) return;
    dispatch(foodSliceThunks.showDuplicateFood(duplicateId));
  }, [duplicateId]);

  if (showFoodInProgress) {
    return <LoadingContainer />;
  }

  if (showFoodError) {
    return <ErrorMessage message={showFoodError.message} />;
  }

  return (
    <EditPartnerFoodForm
      onSubmit={handleSubmit}
      initialValues={initialValues}
      inProgress={createFoodInProgress}
      formError={createFoodError}
    />
  );
};

export default CreatePartnerFoodPage;
