import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceAction, foodSliceThunks } from '@redux/slices/foods.slice';
import { FIXED_MENU_KEY } from '@utils/enums';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getSubmitFoodData } from '../utils';

const CreatePartnerFoodPage = () => {
  const dispatch = useAppDispatch();
  const { restaurantId = '' } = useRouter().query;
  const { createFoodInProgress, createFoodError } = useAppSelector(
    (state) => state.foods,
    shallowEqual,
  );
  const handleSubmit = (values: TEditPartnerFoodFormValues) =>
    dispatch(
      foodSliceThunks.createPartnerFoodListing(
        getSubmitFoodData({ ...values, restaurantId: restaurantId as string }),
      ),
    );

  const initialValues = useMemo(
    () => ({ images: [1, 2, 3, 4, 5], menuType: FIXED_MENU_KEY }),
    [],
  ) as TEditPartnerFoodFormValues;

  useEffect(() => {
    dispatch(foodSliceAction.setInitialStates());
  }, []);

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
