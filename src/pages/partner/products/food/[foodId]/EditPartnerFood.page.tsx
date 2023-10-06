import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import PopupModal from '@components/PopupModal/PopupModal';
import StepTabs from '@components/StepTabs/StepTabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  CREATE_FOOD_TABS,
  FOOD_ADDITIONAL_INFO_TAB,
  FOOD_BASIC_INFO_TAB,
  FOOD_DETAIL_INFO_TAB,
  FoodWizard,
  TAB_STEPS,
} from '@pages/partner/products/food/create/CreatePartnerFood.page';
import { partnerThunks } from '@redux/slices/partners.slice';
import { partnerPaths } from '@src/paths';
import { IntegrationListing } from '@src/utils/data';
import type { TObject } from '@src/utils/types';
import { parsePrice } from '@src/utils/validators';
import { EFoodTypes, EMenuTypes } from '@utils/enums';
import { getInitialAddImages } from '@utils/images';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import {
  partnerFoodSliceActions,
  partnerFoodSliceThunks,
} from '../PartnerFood.slice';
import type { TEditPartnerFoodFormValues } from '../utils';
import { getUpdateFoodData } from '../utils';

import css from './EditPartnerFood.module.scss';

const EditPartnerFoodPage = () => {
  const router = useRouter();
  const { foodId = '', restaurantId = '', tab: tabFromQuery } = router.query;
  const dispatch = useAppDispatch();
  const sendingApprovalToAdminModalController = useBoolean();

  const [currentTab, setCurrentTab] = useState<string>(
    (tabFromQuery as string) || FOOD_BASIC_INFO_TAB,
  );

  const {
    currentFoodListing,
    showFoodInProgress,
    showFoodError,
    updateFoodInProgress,
    updateFoodError,
    uploadingImages,
  } = useAppSelector((state) => state.foods, shallowEqual);

  const {
    showPartnerListingInProgress,
    showPartnerListingError,
    partnerListingRef,
  } = useAppSelector((state) => state.partners, shallowEqual);
  const currentFoodListingGetter = IntegrationListing(currentFoodListing);
  const { packaging, foodType, category } =
    currentFoodListingGetter.getPublicData();

  const moveableSteps =
    !packaging || !foodType || !category
      ? [FOOD_BASIC_INFO_TAB, FOOD_DETAIL_INFO_TAB]
      : [FOOD_BASIC_INFO_TAB, FOOD_DETAIL_INFO_TAB, FOOD_ADDITIONAL_INFO_TAB];

  const handleSubmit = async (values: TEditPartnerFoodFormValues) => {
    const currentTabIndex = CREATE_FOOD_TABS.indexOf(currentTab);
    await dispatch(
      partnerFoodSliceThunks.updatePartnerFoodListing(
        getUpdateFoodData({
          ...values,
          id: foodId as string,
          ...(currentTabIndex === CREATE_FOOD_TABS.length - 1 && {
            isDraft: false,
          }),
        }),
      ),
    );

    if (currentTabIndex !== CREATE_FOOD_TABS.length - 1) {
      setCurrentTab(
        CREATE_FOOD_TABS[currentTabIndex + 1] || FOOD_BASIC_INFO_TAB,
      );
    } else {
      sendingApprovalToAdminModalController.setTrue();
    }
  };

  const {
    minQuantity: minQuantityFromPartner,
    maxQuantity: maxQuantityFromPartner,
  } = IntegrationListing(partnerListingRef).getPublicData();

  const initialValues = useMemo(() => {
    const attributes = currentFoodListing?.attributes || {};

    const {
      publicData = {},
      price,
      title,
      description,
    } = attributes || ({} as TObject);
    const { menuType, minQuantity, maxQuantity, minOrderHourInAdvance } =
      publicData;

    return {
      images: getInitialAddImages(currentFoodListing?.images || []),
      title,
      description,
      price: parsePrice(price?.amount || 0),
      ...publicData,
      menuType: menuType || EMenuTypes.fixedMenu,
      foodType: foodType || EFoodTypes.savoryDish,
      minQuantity: minQuantity || minQuantityFromPartner,
      maxQuantity: maxQuantity || maxQuantityFromPartner,
      minOrderHourInAdvance: minOrderHourInAdvance || 24,
    };
  }, [
    currentFoodListing?.attributes,
    currentFoodListing?.images,
    foodType,
    maxQuantityFromPartner,
    minQuantityFromPartner,
  ]) as TEditPartnerFoodFormValues;

  const goBackToManageFood = () => {
    router.push(partnerPaths.ManageFood);
  };

  const handleConfirmBtnClick = () => {
    sendingApprovalToAdminModalController.setFalse();
    router.push(partnerPaths.ManageFood);
  };

  useEffect(() => {
    if (restaurantId) {
      dispatch(partnerThunks.showPartnerRestaurantListing(restaurantId));
    }
  }, [restaurantId, dispatch]);

  useEffect(() => {
    dispatch(partnerFoodSliceActions.setInitialStates());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!foodId) return;
    dispatch(partnerFoodSliceThunks.showPartnerFoodListing(foodId));
  }, [dispatch, foodId]);

  if (showFoodInProgress || showPartnerListingInProgress) {
    return <LoadingContainer />;
  }

  const showError = showFoodError || showPartnerListingError;

  if (showError) {
    return <ErrorMessage message={showError.message} />;
  }

  return (
    <div className={css.root}>
      <h3 className={css.title}>
        <FormattedMessage id="EditPartnerFood.title" />
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
          moveableSteps={moveableSteps}
        />
      </div>
      <div className={css.mobileFormWrapper}>
        <FoodWizard
          tab={currentTab}
          goBack={() => {}}
          disabled={false}
          handleSubmit={handleSubmit}
          inProgress={updateFoodInProgress}
          initialValues={initialValues}
        />
      </div>
      <div className={css.desktopFormWrapper}>
        <EditPartnerFoodForm
          onSubmit={handleSubmit}
          inProgress={updateFoodInProgress}
          disabled={uploadingImages || updateFoodInProgress}
          formError={updateFoodError}
          initialValues={initialValues}
          isEditting
        />
      </div>
      <PopupModal
        id="SendingApprovalToAdminModal"
        isOpen={sendingApprovalToAdminModalController.value}
        handleClose={sendingApprovalToAdminModalController.setFalse}
        containerClassName={css.confirmContainer}
        shouldHideIconClose>
        <>
          <div className={css.cannotRemoveFoodModalTitle}>
            <IconTickWithBackground className={css.icon} />
          </div>
          <div className={css.content}>
            Món của bạn đã được gửi đến PITO, đội ngũ PITO sẽ kiểm duyệt trong
            24h kể từ thời điểm nhận được món ăn.
          </div>
          <Button
            onClick={handleConfirmBtnClick}
            variant="secondary"
            type="button"
            className={css.noRemoveFoodConfirmBtn}>
            Đã hiểu
          </Button>
        </>
      </PopupModal>
    </div>
  );
};

export default EditPartnerFoodPage;
