import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import StepTabs from '@components/StepTabs/StepTabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { resetImage } from '@redux/slices/uploadImage.slice';
import { partnerPaths } from '@src/paths';
import { CurrentUser, IntegrationListing } from '@utils/data';
import { EFoodApprovalState, EFoodType, EMenuType } from '@utils/enums';
import { getInitialAddImages } from '@utils/images';
import type { TKeyValue, TObject } from '@utils/types';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import FoodAdditionalInfoTab from '../components/FoodAdditionalInfoTab/FoodAdditionalInfoTab';
import FoodBasicInfoTab from '../components/FoodBasicInfoTab/FoodBasicInfoTab';
import FoodDetailInfoTab from '../components/FoodDetailInfoTab/FoodDetailInfoTab';
import {
  partnerFoodSliceActions,
  partnerFoodSliceThunks,
} from '../PartnerFood.slice';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getDuplicateData, getSubmitFoodData } from '../utils';

import css from './CreatePartnerFood.module.scss';

export const FOOD_BASIC_INFO_TAB = 'foodBasicInfo';
export const FOOD_DETAIL_INFO_TAB = 'foodDetailInfo';
export const FOOD_ADDITIONAL_INFO_TAB = 'foodAdditionalInfo';

export const CREATE_FOOD_TABS = [
  FOOD_BASIC_INFO_TAB,
  FOOD_DETAIL_INFO_TAB,
  FOOD_ADDITIONAL_INFO_TAB,
];

export const TAB_STEPS: TKeyValue[] = [
  {
    key: FOOD_BASIC_INFO_TAB,
    label: 'Thông tin cơ bản',
  },
  {
    key: FOOD_DETAIL_INFO_TAB,
    label: 'Chi tiết món ăn',
  },
  {
    key: FOOD_ADDITIONAL_INFO_TAB,
    label: 'Thông tin thêm',
  },
];

export const FoodWizard: React.FC<any> = (props) => {
  const { tab, handleSubmit, inProgress, initialValues } = props;

  switch (tab) {
    case FOOD_BASIC_INFO_TAB:
      return (
        <FoodBasicInfoTab
          onSubmit={handleSubmit}
          inProgress={inProgress}
          initialValues={initialValues}
        />
      );
    case FOOD_DETAIL_INFO_TAB:
      return (
        <FoodDetailInfoTab
          onSubmit={handleSubmit}
          inProgress={inProgress}
          initialValues={initialValues}
        />
      );
    case FOOD_ADDITIONAL_INFO_TAB:
      return (
        <FoodAdditionalInfoTab
          onSubmit={handleSubmit}
          inProgress={inProgress}
          initialValues={initialValues}
        />
      );

    default:
      return <></>;
  }
};

const CreatePartnerFoodPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { duplicateId, tab: tabFromQuery, fromTab } = router.query;
  const [currentTab, setCurrentTab] = useState<string>(
    (tabFromQuery as string) || FOOD_BASIC_INFO_TAB,
  );
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

    const isCreateNewFood = router.pathname === partnerPaths.CreateFood;
    if (isCreateNewFood) {
      const { payload: foodListing } = await dispatch(
        partnerFoodSliceThunks.createPartnerFoodListing(
          getSubmitFoodData({
            ...values,
            restaurantId: restaurantListingId,
            adminApproval: EFoodApprovalState.PENDING,
            isDraft: false,
          }),
        ),
      );

      dispatch(partnerFoodSliceThunks.fetchDraftFood());

      router.replace({
        pathname: partnerPaths.EditFood,
        query: {
          foodId: foodListing.id.uuid,
          tab: FOOD_DETAIL_INFO_TAB,
          fromTab,
        },
      });
    }
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

  const goBackToManageFood = () => {
    router.push({ pathname: partnerPaths.ManageFood, query: { tab: fromTab } });
  };

  useEffect(() => {
    if (!duplicateId) {
      dispatch(partnerFoodSliceActions.setInitialStates());
    }
  }, [duplicateId, dispatch]);

  useEffect(() => {
    if (!duplicateId) return;
    dispatch(partnerFoodSliceThunks.showDuplicateFood(duplicateId));
  }, [duplicateId, dispatch]);

  useEffect(() => {
    dispatch(resetImage());
  }, [dispatch]);

  if (showFoodInProgress || showPartnerListingInProgress) {
    return <LoadingContainer />;
  }

  const showError = showPartnerListingError || showFoodError;

  if (showError) {
    return <ErrorMessage message={showError.message} />;
  }

  return (
    <div className={css.root}>
      <h3 className={css.title}>
        <FormattedMessage id="CreatePartnerFood.title" />
      </h3>
      <div className={css.mobileHeader}>
        <IconArrow
          direction="left"
          className={css.icon}
          onClick={goBackToManageFood}
        />
        <div className={css.headerTitle}>Tạo món ăn</div>
      </div>
      <div className={css.stepTabContainer}>
        <StepTabs
          tabs={TAB_STEPS}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          moveableSteps={[FOOD_BASIC_INFO_TAB]}
        />
      </div>
      <div className={css.mobileFormWrapper}>
        <FoodWizard
          tab={currentTab}
          goBack={() => {}}
          disabled={false}
          handleSubmit={handleSubmit}
          inProgress={createFoodInProgress}
          initialValues={initialValues}
        />
      </div>
      <div className={css.desktopFormWrapper}>
        <EditPartnerFoodForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          inProgress={createFoodInProgress}
          disabled={uploadingImages || createFoodInProgress}
          formError={createFoodError}
        />
      </div>
    </div>
  );
};

export default CreatePartnerFoodPage;
