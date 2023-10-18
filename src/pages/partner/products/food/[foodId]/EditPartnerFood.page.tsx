import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { intersection, isEmpty } from 'lodash';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
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
import { resetImage } from '@redux/slices/uploadImage.slice';
import { partnerPaths } from '@src/paths';
import { CurrentUser, IntegrationListing } from '@src/utils/data';
import type { TObject } from '@src/utils/types';
import { parsePrice } from '@src/utils/validators';
import {
  EFoodApprovalState,
  EFoodTypes,
  EListingStates,
  EMenuTypes,
  ESlackNotificationType,
} from '@utils/enums';
import { getInitialAddImages } from '@utils/images';

import EditPartnerFoodForm from '../components/EditPartnerFoodForm/EditPartnerFoodForm';
import { getObjectDifferences, NEW_FOOD_ID } from '../helpers/editFood';
import {
  partnerFoodSliceActions,
  partnerFoodSliceThunks,
} from '../PartnerFood.slice';
import {
  type TEditPartnerFoodFormValues,
  getSubmitFoodData,
  getUpdateFoodData,
} from '../utils';

import css from './EditPartnerFood.module.scss';

const EditPartnerFoodPage = () => {
  const router = useRouter();
  const {
    foodId = '',
    restaurantId = '',
    tab: tabFromQuery,
    fromTab,
  } = router.query;
  const dispatch = useAppDispatch();
  const sendingApprovalToAdminModalController = useBoolean();
  const reSendingApprovalToAdminModalController = useBoolean();
  const [isNewFood, setIsNewFood] = useState<boolean>(!foodId || true);
  const [currentTab, setCurrentTab] = useState<string>(
    (tabFromQuery as string) || FOOD_BASIC_INFO_TAB,
  );
  const backToPendingTabController = useBoolean();

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = CurrentUser(currentUser!);
  const { restaurantListingId } = currentUserGetter.getMetadata();

  const [changeContent, setChangeContent] = useState<TObject>({}); // for slack notification
  const {
    currentFoodListing,
    showFoodError,
    updateFoodInProgress,
    updateFoodError,
    uploadingImages,
    createFoodInProgress,
  } = useAppSelector((state) => state.PartnerFood, shallowEqual);

  const { showPartnerListingError, partnerListingRef } = useAppSelector(
    (state) => state.partners,
    shallowEqual,
  );
  const currentFoodListingGetter = IntegrationListing(currentFoodListing);
  const { title, price } = currentFoodListingGetter.getAttributes();
  const {
    packaging,
    foodType,
    category,
    sideDishes: currentSideDishes,
    minOrderNumberInAdvance,
    minOrderHourInAdvance,
  } = currentFoodListingGetter.getPublicData();
  const {
    adminApproval: currentAdminApproval,
    restaurantId: foodRestaurantId,
    isDraft: currentIsDraft,
  } = currentFoodListingGetter.getMetadata();
  const { state: foodState } = currentFoodListingGetter.getAttributes();

  const moveableSteps =
    !title ||
    isEmpty(price) ||
    !minOrderNumberInAdvance ||
    !minOrderHourInAdvance
      ? [FOOD_BASIC_INFO_TAB]
      : !packaging || !foodType || !category
      ? [FOOD_BASIC_INFO_TAB, FOOD_DETAIL_INFO_TAB]
      : [FOOD_BASIC_INFO_TAB, FOOD_DETAIL_INFO_TAB, FOOD_ADDITIONAL_INFO_TAB];

  const {
    minQuantity: minQuantityFromPartner,
    maxQuantity: maxQuantityFromPartner,
  } = IntegrationListing(partnerListingRef).getPublicData();

  const initialValues = useMemo(() => {
    const attributes = currentFoodListing?.attributes || {};

    const { publicData = {}, description } = attributes || ({} as TObject);
    const { menuType, minQuantity, maxQuantity } = publicData;

    if (isNewFood) {
      return {};
    }

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
      minOrderNumberInAdvance: minOrderNumberInAdvance || 1,
    };
  }, [
    currentFoodListing?.attributes,
    currentFoodListing?.images,
    isNewFood,
    title,
    price?.amount,
    foodType,
    minQuantityFromPartner,
    maxQuantityFromPartner,
    minOrderHourInAdvance,
    minOrderNumberInAdvance,
  ]) as TEditPartnerFoodFormValues;

  const goBackToManageFood = () => {
    router.push({ pathname: partnerPaths.ManageFood, query: { tab: fromTab } });
  };

  const handleConfirmBtnClick = () => {
    sendingApprovalToAdminModalController.setFalse();
    dispatch(
      partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.PENDING),
    );
    if (foodState === EListingStates.pendingApproval) {
      dispatch(
        partnerFoodSliceThunks.sendSlackNotification({
          foodId: foodId as string,
          notificationType: ESlackNotificationType.CREATE_NEW_FOOD,
          params: {
            foodId: foodId as string,
            restaurantId: foodRestaurantId,
          },
        }),
      );
      dispatch(
        partnerFoodSliceThunks.updatePartnerFoodListing({
          id: foodId as string,
          state: EListingStates.published,
        }),
      );
    }
    router.push({
      pathname: partnerPaths.ManageFood,
      query: {
        tab: backToPendingTabController.value
          ? EFoodApprovalState.PENDING
          : fromTab,
      },
    });
  };

  const handleNoResendApprovalBtnClick = () => {
    reSendingApprovalToAdminModalController.setFalse();
    router.push({ pathname: partnerPaths.ManageFood, query: { tab: fromTab } });
  };

  const handleResendApprovalBtnClick = async () => {
    await dispatch(
      partnerFoodSliceThunks.updatePartnerFoodListing({
        id: foodId as string,
        metadata: {
          adminApproval: EFoodApprovalState.PENDING,
        },
        shouldShowToast: false,
      }),
    );
    await dispatch(
      partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.PENDING),
    );
    await dispatch(
      partnerFoodSliceThunks.sendSlackNotification({
        foodId: foodId as string,
        notificationType: ESlackNotificationType.UPDATE_FOOD,
        params: {
          restaurantId: foodRestaurantId,
          changeContent,
        },
      }),
    );
    reSendingApprovalToAdminModalController.setFalse();
    router.push({ pathname: partnerPaths.ManageFood, query: { tab: fromTab } });
  };

  const handleSubmit = async (values: TEditPartnerFoodFormValues) => {
    if (isNewFood) {
      const { payload: foodListing } = await dispatch(
        partnerFoodSliceThunks.createPartnerFoodListing(
          getSubmitFoodData({
            ...values,
            restaurantId: restaurantListingId,
            isDraft: currentTab !== FOOD_ADDITIONAL_INFO_TAB,
          }),
        ),
      );
      setCurrentTab(CREATE_FOOD_TABS[1]);
      setIsNewFood(false);
      dispatch(partnerFoodSliceThunks.fetchDraftFood());

      return router.replace({
        pathname: partnerPaths.EditFood,
        query: {
          foodId: foodListing.id.uuid,
          tab: FOOD_DETAIL_INFO_TAB,
          fromTab,
        },
      });
    }

    const currentTabIndex = CREATE_FOOD_TABS.indexOf(currentTab);
    const differentAttributesAfterEditFood = getObjectDifferences(
      initialValues,
      values,
    );
    const { sideDishes: changeSideDishes } = differentAttributesAfterEditFood;
    const { sideDishes: newSideDishes } = values;
    const changeApprovalAttributes = intersection(
      Object.keys(differentAttributesAfterEditFood),
      ['title', 'description', 'price', 'images', 'mealType', 'sideDishes'],
    );

    const shouldChangeAdminApprovalToPending =
      changeApprovalAttributes.length > 0 &&
      currentAdminApproval !== EFoodApprovalState.DECLINED;

    await dispatch(
      partnerFoodSliceThunks.updatePartnerFoodListing({
        shouldShowToast: false,
        ...getUpdateFoodData({
          ...values,
          id: foodId as string,
          ...(currentTabIndex === CREATE_FOOD_TABS.length - 1 && {
            isDraft: false,
          }),
          ...(shouldChangeAdminApprovalToPending && {
            adminApproval: EFoodApprovalState.PENDING,
          }),
        }),
      }),
    );

    setChangeContent({
      ...changeContent,
      ...differentAttributesAfterEditFood,
      ...(changeSideDishes && {
        sideDishes: {
          oldValues: currentSideDishes,
          newValues: newSideDishes,
        },
      }),
    });

    if (!currentIsDraft) {
      if (
        currentAdminApproval === EFoodApprovalState.ACCEPTED &&
        changeApprovalAttributes.length > 0
      ) {
        sendingApprovalToAdminModalController.setTrue();
        dispatch(
          partnerFoodSliceThunks.sendSlackNotification({
            foodId: foodId as string,
            notificationType: ESlackNotificationType.UPDATE_FOOD,
            params: {
              foodId: foodId as string,
              restaurantId: foodRestaurantId,
              changeContent: {
                ...differentAttributesAfterEditFood,
                ...(changeSideDishes && {
                  sideDishes: {
                    oldValues: currentSideDishes,
                    newValues: newSideDishes,
                  },
                }),
              },
            },
          }),
        );
      } else if (
        currentAdminApproval === EFoodApprovalState.DECLINED &&
        changeApprovalAttributes.length > 0
      ) {
        reSendingApprovalToAdminModalController.setTrue();
      }
    } else if (currentTabIndex !== CREATE_FOOD_TABS.length - 1) {
      setCurrentTab(
        CREATE_FOOD_TABS[currentTabIndex + 1] || FOOD_BASIC_INFO_TAB,
      );
    } else {
      sendingApprovalToAdminModalController.setTrue();
      backToPendingTabController.setTrue();
    }
  };

  const handleDesktopSubmit = async (values: TEditPartnerFoodFormValues) => {
    const { payload: foodListing } = await dispatch(
      partnerFoodSliceThunks.createPartnerFoodListing(
        getSubmitFoodData({
          ...values,
          restaurantId: restaurantListingId,
          isDraft: currentTab !== FOOD_ADDITIONAL_INFO_TAB,
          state: EListingStates.published,
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
    if (!foodId || foodId === NEW_FOOD_ID) return;
    setIsNewFood(false);
    dispatch(partnerFoodSliceThunks.showPartnerFoodListing(foodId));
  }, [dispatch, foodId]);

  useEffect(() => {
    dispatch(resetImage());
  }, [dispatch]);

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
          inProgress={updateFoodInProgress || createFoodInProgress}
          initialValues={initialValues}
        />
      </div>
      <div className={css.desktopFormWrapper}>
        <EditPartnerFoodForm
          onSubmit={handleDesktopSubmit}
          inProgress={updateFoodInProgress || createFoodInProgress}
          disabled={uploadingImages || updateFoodInProgress}
          formError={updateFoodError}
          initialValues={initialValues}
          isEditting={
            !isNewFood && foodState !== EListingStates.pendingApproval
          }
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
            type="button"
            className={css.noRemoveFoodConfirmBtn}>
            Đã hiểu
          </Button>
        </>
      </PopupModal>
      <PopupModal
        id="ReSendingApprovalToAdminModal"
        isOpen={reSendingApprovalToAdminModalController.value}
        handleClose={reSendingApprovalToAdminModalController.setFalse}
        containerClassName={css.confirmContainer}
        shouldHideIconClose>
        <>
          <div className={css.cannotRemoveFoodModalTitle}>
            <IconTickWithBackground className={css.icon} />
          </div>
          <div className={css.content}>
            Cập nhật món thành công, bạn có muốn gửi kiểm duyệt lại?
          </div>
          <div className={css.bottomBtns}>
            <Button
              onClick={handleNoResendApprovalBtnClick}
              type="button"
              variant="secondary"
              className={css.noRemoveFoodConfirmBtn}>
              Không
            </Button>
            <Button
              onClick={handleResendApprovalBtnClick}
              type="button"
              className={css.noRemoveFoodConfirmBtn}>
              Gửi kiểm duyệt lại
            </Button>
          </div>
        </>
      </PopupModal>
    </div>
  );
};

export default EditPartnerFoodPage;
