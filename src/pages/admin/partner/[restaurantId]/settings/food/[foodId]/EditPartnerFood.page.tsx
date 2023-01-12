import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { getInitialAddImages } from '@utils/images';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getUpdateFoodData } from '../utils';

const EditPartnerFoodPage = () => {
  const { foodId = '' } = useRouter().query;
  const dispatch = useAppDispatch();

  const {
    currentFoodListing,
    showFoodInProgress,
    showFoodError,
    updateFoodInProgress,
    updateFoodError,
  } = useAppSelector((state) => state.foods, shallowEqual);

  const handleSubmit = (values: TEditPartnerFoodFormValues) =>
    dispatch(
      foodSliceThunks.updatePartnerFoodListing(
        getUpdateFoodData({ ...values, id: foodId as string }),
      ),
    );
  const initialValues = useMemo(() => {
    const attributes = currentFoodListing?.attributes || {};
    const { publicData = {}, price, title, description } = attributes || {};
    return {
      images: getInitialAddImages(currentFoodListing?.images || []),
      title,
      description,
      price: price?.amount,
      ...publicData,
    };
  }, [currentFoodListing]) as TEditPartnerFoodFormValues;

  useEffect(() => {
    if (!foodId) return;
    dispatch(foodSliceThunks.showPartnerFoodListing(foodId));
  }, [dispatch, foodId]);

  if (showFoodInProgress) {
    return <LoadingContainer />;
  }

  if (showFoodError) {
    return <ErrorMessage message={showFoodError.message} />;
  }

  return (
    <EditPartnerFoodForm
      onSubmit={handleSubmit}
      inProgress={updateFoodInProgress}
      formError={updateFoodError}
      initialValues={initialValues}
    />
  );
};

export default EditPartnerFoodPage;
