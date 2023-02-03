import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceAction, foodSliceThunks } from '@redux/slices/foods.slice';
import { adminRoutes } from '@src/paths';
import { EFoodTypes, EMenuTypes } from '@utils/enums';
import { getInitialAddImages } from '@utils/images';
import type { TIntergrationFoodListing } from '@utils/types';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getDuplicateData, getSubmitFoodData } from '../utils';
import css from './CreatePartnerFood.module.scss';

const CreatePartnerFoodPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { restaurantId = '', duplicateId } = router.query;
  const {
    createFoodInProgress,
    createFoodError,
    currentFoodListing,
    showFoodInProgress,
    showFoodError,
  } = useAppSelector((state) => state.foods, shallowEqual);
  const redirectToEditPage = (listing: TIntergrationFoodListing) => {
    setTimeout(() => {
      const foodId = listing?.id?.uuid;
      if (foodId)
        return router.push({
          pathname: adminRoutes.EditPartnerFood.path,
          query: {
            foodId,
            restaurantId,
          },
        });
    }, 1000);
  };
  const handleSubmit = async (values: TEditPartnerFoodFormValues) => {
    if (duplicateId) {
      const response = await dispatch(
        foodSliceThunks.duplicateFood(
          getDuplicateData({
            ...values,
            restaurantId: restaurantId as string,
          }),
        ),
      );
      redirectToEditPage(response.payload);
      return response;
    }
    const response = await dispatch(
      foodSliceThunks.createPartnerFoodListing(
        getSubmitFoodData({
          ...values,
          restaurantId: restaurantId as string,
        }),
      ),
    );
    redirectToEditPage(response.payload);
    return response;
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
      menuType: menuType || EMenuTypes.cycleMenu,
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
    <>
      <h3 className={css.title}>
        <FormattedMessage id="CreatePartnerFood.title" />
      </h3>
      <EditPartnerFoodForm
        onSubmit={handleSubmit}
        initialValues={initialValues}
        inProgress={createFoodInProgress}
        formError={createFoodError}
      />
    </>
  );
};

export default CreatePartnerFoodPage;
