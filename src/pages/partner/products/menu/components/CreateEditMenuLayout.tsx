/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import IconDangerWithCircle from '@components/Icons/IconDangerWithCircle/IconDangerWithCircle';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { EListingStates } from '@src/utils/enums';
import {
  historyPushState,
  parseLocationSearchToObject,
} from '@src/utils/history';
import type { TObject } from '@src/utils/types';

import { PartnerManageMenusThunks } from '../PartnerManageMenus.slice';

import CreateEditMenuForm, { MAX_MENU_LENGTH } from './CreateEditMenuForm';

import css from './CreateEditMenuLayout.module.scss';

export enum EEditPartnerMenuMobileStep {
  info = 'info',
  mealSettings = 'mealSettings',
}

const verifyData = ({
  draftMenu,
  currStep,
  initialValues,
  isCreateFlow = false,
  isDraftEditFlow = false,
}: {
  draftMenu: TObject;
  initialValues: TObject;
  currStep: EEditPartnerMenuMobileStep;
  isCreateFlow: boolean;
  isDraftEditFlow: boolean;
}) => {
  const {
    menuName,
    mealType,
    mealTypes = [],
    startDate,
    endDate,
    foodByDate = {},
  } = draftMenu || {};

  const isDraftDataValid =
    !isEmpty(menuName) &&
    menuName?.length <= MAX_MENU_LENGTH &&
    !isEmpty(isCreateFlow ? mealTypes : mealType) &&
    typeof startDate === 'number' &&
    typeof endDate === 'number';

  const isFoodByDateValid = isDraftEditFlow
    ? Object.keys(foodByDate).length > 0 &&
      Object.values(foodByDate).some((mealByDate: any) => {
        return Object.values(mealByDate).some((item) => !isEmpty(item));
      })
    : Object.values(foodByDate).some((item) => !isEmpty(item));

  const isAllMealsSetup = isDraftEditFlow
    ? Object.keys(foodByDate).length > 0 &&
      Object.values(foodByDate).every((mealByDate: any) => {
        return Object.values(mealByDate).every((item) => !isEmpty(item));
      })
    : Object.values(foodByDate).every((item) => !isEmpty(item));

  let enableNext = isDraftDataValid;
  let enableSubmit = false;

  switch (currStep) {
    case EEditPartnerMenuMobileStep.info: {
      enableSubmit =
        isDraftDataValid &&
        (isCreateFlow ||
          menuName !== initialValues.menuName ||
          !isEqual(mealTypes, initialValues.mealTypes) ||
          startDate !== initialValues.startDate ||
          endDate !== initialValues.endDate);
      break;
    }
    case EEditPartnerMenuMobileStep.mealSettings: {
      enableSubmit = isFoodByDateValid;
      enableNext = isFoodByDateValid;
      break;
    }
    default:
      break;
  }

  return { enableNext, enableSubmit, isAllMealsSetup };
};

type TCreateEditMenuLayoutProps = {};

const CreateEditMenuLayout: React.FC<TCreateEditMenuLayoutProps> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const confirmPublishDraftMenuControl = useBoolean();
  const confirmCompleteDraftMenuControl = useBoolean();
  const {
    query: { menuId: menuIdFromRouter },
    isReady: isRouterReady,
  } = router;
  const { menuId: menuIdFromSearch } = parseLocationSearchToObject();

  const [currStep, setCurrStep] = useState(EEditPartnerMenuMobileStep.info);
  const menu = useAppSelector((state) => state.PartnerManageMenus.menu);
  const createDraftMenuInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.createDraftMenuInProgress,
  );
  const createDraftMenuError = useAppSelector(
    (state) => state.PartnerManageMenus.createDraftMenuError,
  );
  const updateDraftMenuInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.updateDraftMenuInProgress,
  );
  const updateDraftMenuError = useAppSelector(
    (state) => state.PartnerManageMenus.updateDraftMenuError,
  );
  const publishDraftMenuInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.publishDraftMenuInProgress,
  );
  const publishDraftMenuError = useAppSelector(
    (state) => state.PartnerManageMenus.publishDraftMenuError,
  );
  const draftMenu = useAppSelector(
    (state) => state.PartnerManageMenus.draftMenu,
  );

  const menuGetter = Listing(menu);
  const { title } = menuGetter.getAttributes();
  const { listingState = EListingStates.draft } = Listing(menu).getMetadata();
  const {
    startDate,
    endDate,
    mealType,
    mealTypes = [],
    daysOfWeek = [],
    foodsByDate = {},
    draftFoodByDate = {},
  } = Listing(menu).getPublicData();
  const isCreateFlow = menu === null;
  const isDraftEditFlow = listingState === EListingStates.draft || isCreateFlow;

  const isInfoTab = currStep === EEditPartnerMenuMobileStep.info;
  const isMealSettingsTab =
    currStep === EEditPartnerMenuMobileStep.mealSettings;

  const submitting =
    createDraftMenuInProgress ||
    updateDraftMenuInProgress ||
    publishDraftMenuInProgress;
  const initialValues = useMemo(
    () => ({
      menuName: title,
      startDate,
      endDate,
      mealType,
      mealTypes,
      foodsByDate,
      draftFoodByDate,
      foodByDate: isDraftEditFlow ? draftFoodByDate : foodsByDate,
    }),
    [
      isDraftEditFlow,
      title,
      endDate?.toString(),
      startDate?.toString(),
      mealType,
      JSON.stringify(draftFoodByDate),
      JSON.stringify(mealTypes),
      JSON.stringify(mealTypes),
    ],
  );
  const { enableNext, enableSubmit, isAllMealsSetup } = useMemo(
    () =>
      verifyData({
        draftMenu,
        initialValues,
        currStep,
        isCreateFlow,
        isDraftEditFlow,
      }),
    [
      currStep,
      JSON.stringify(initialValues),
      JSON.stringify(draftMenu),
      isCreateFlow,
      isDraftEditFlow,
    ],
  );

  const infoNumberClasses = classNames(css.stepNumber, {
    [css.stepNumberActive]: isInfoTab,
  });
  const infoStepInfoClasses = classNames({
    [css.stepInfoActive]: isInfoTab,
  });

  const mealSettingsNumberClasses = classNames(css.stepNumber, {
    [css.stepNumberActive]: isMealSettingsTab,
  });
  const mealSettingsStepInfoClasses = classNames({
    [css.stepInfoActive]: isMealSettingsTab,
  });

  const contentContainerClasses = classNames(css.contentContainer, {
    [css.infoTab]: isInfoTab,
    [css.mealSettingsTab]: isMealSettingsTab,
  });

  const handleConfirmCompletePublishDraft = () => {
    confirmCompleteDraftMenuControl.setFalse();

    router.push(partnerPaths.ManageMenus);
  };

  const handlePublishDraftMenu = async () => {
    confirmPublishDraftMenuControl.setFalse();

    const { meta } = await dispatch(
      PartnerManageMenusThunks.publishDraftMenu(),
    );

    if (meta.requestStatus === 'fulfilled') {
      confirmCompleteDraftMenuControl.setTrue();
    }
  };

  const handleNavigateToNextStep = async () => {
    let shouldNavigateToNextStep = true;

    if (isInfoTab && enableSubmit && !submitting) {
      if (isCreateFlow) {
        const { meta, payload } = await dispatch(
          PartnerManageMenusThunks.createDraftMenu(),
        );

        if (meta.requestStatus === 'fulfilled') {
          historyPushState('menuId', payload.id.uuid);
        } else {
          shouldNavigateToNextStep = false;
        }
      } else {
        const { meta } = await dispatch(
          PartnerManageMenusThunks.updateDraftMenu(),
        );

        if (meta.requestStatus !== 'fulfilled') {
          shouldNavigateToNextStep = false;
        }
      }
    }

    if (isMealSettingsTab && enableSubmit && !submitting) {
      shouldNavigateToNextStep = false;

      if (isAllMealsSetup && isDraftEditFlow) {
        await handlePublishDraftMenu();
      } else {
        confirmPublishDraftMenuControl.setTrue();
      }
    }

    if (enableNext && shouldNavigateToNextStep) {
      setCurrStep(EEditPartnerMenuMobileStep.mealSettings);
    }
  };

  const handleNavigateToPrevStep = () => {
    if (isMealSettingsTab) {
      setCurrStep(EEditPartnerMenuMobileStep.info);
    }
  };

  const handleNavigateToMenuPage = () => {
    router.push(partnerPaths.ManageMenus);
  };

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <IconArrow direction="left" onClick={handleNavigateToMenuPage} />

        <RenderWhen condition={isRouterReady}>
          {menuIdFromRouter || menuIdFromSearch ? 'Chỉnh sửa menu' : 'Tạo menu'}
        </RenderWhen>
      </div>
      <div className={css.stepsContainer}>
        <div className={css.stepContainer} onClick={handleNavigateToPrevStep}>
          <div className={infoNumberClasses}>1</div>
          <div className={infoStepInfoClasses}>Thông tin thực đơn</div>
        </div>
        <div className={css.separator}></div>
        <div className={css.stepContainer} onClick={handleNavigateToNextStep}>
          <div className={mealSettingsNumberClasses}>2</div>
          <div className={mealSettingsStepInfoClasses}>Thiết lập thực đơn</div>
        </div>
      </div>

      <div className={contentContainerClasses}>
        <CreateEditMenuForm
          mealType={mealType}
          foodsByDate={foodsByDate}
          draftFoodByDate={draftFoodByDate}
          daysOfWeek={daysOfWeek}
          isDraftEditFlow={isDraftEditFlow}
          isMealSettingsTab={isMealSettingsTab}
          onSubmit={() => {}}
          initialValues={initialValues}
        />
      </div>

      <AlertModal
        isOpen={confirmPublishDraftMenuControl.value}
        shouldFullScreenInMobile={false}
        containerClassName={css.confirmPublishModal}
        handleClose={confirmPublishDraftMenuControl.setFalse}
        cancelLabel={'Tiếp tục thêm món'}
        shouldHideIconClose
        confirmLabel={'Hoàn tất'}
        onCancel={confirmPublishDraftMenuControl.setFalse}
        onConfirm={handlePublishDraftMenu}
        cancelDisabled={submitting}
        confirmDisabled={submitting}
        actionsClassName={css.confirmPublishModalActions}>
        <div className={css.modalIconContainer}>
          <IconDangerWithCircle />
        </div>
        <div className={css.menuDescription}>
          Các Thứ (hoặc Bữa ăn) còn lại trong tuần{' '}
          <span>chưa được thêm món ăn.</span>
          <p>Bạn có muốn hoàn tất menu?</p>
        </div>
      </AlertModal>

      <AlertModal
        isOpen={confirmCompleteDraftMenuControl.value}
        shouldFullScreenInMobile={false}
        containerClassName={css.completePublishModal}
        handleClose={confirmCompleteDraftMenuControl.setFalse}
        shouldHideIconClose
        confirmLabel={'Đã hiểu'}
        onCancel={confirmCompleteDraftMenuControl.setFalse}
        onConfirm={handleConfirmCompletePublishDraft}
        cancelDisabled={submitting}
        confirmDisabled={submitting}
        actionsClassName={css.completePublishModalActions}>
        <div className={css.modalIconContainer}>
          <IconCheckmarkWithCircle className={css.iconCheckmark} />
        </div>
        <div className={css.menuDescription}>
          Menu “Bữa ăn vui vẻ” của bạn đã được tạo thành công.
        </div>
      </AlertModal>

      <MobileBottomContainer>
        <div className={css.actionContainer}>
          <RenderWhen condition={isInfoTab}>
            <Button
              inProgress={submitting}
              disabled={!enableNext}
              onClick={handleNavigateToNextStep}>
              Tiếp theo
            </Button>

            <RenderWhen.False>
              <Button
                inProgress={submitting}
                disabled={!enableNext}
                onClick={handleNavigateToNextStep}>
                Hoàn tất
              </Button>
              <Button variant="secondary" onClick={handleNavigateToPrevStep}>
                Trở về
              </Button>
            </RenderWhen.False>
          </RenderWhen>

          {createDraftMenuError !== null && (
            <ErrorMessage
              className={css.errorMessage}
              message={createDraftMenuError.message}
            />
          )}
          {updateDraftMenuError !== null && (
            <ErrorMessage
              className={css.errorMessage}
              message={updateDraftMenuError.message}
            />
          )}
          {publishDraftMenuError !== null && (
            <ErrorMessage
              className={css.errorMessage}
              message={publishDraftMenuError.message}
            />
          )}
        </div>
      </MobileBottomContainer>
    </div>
  );
};

export default CreateEditMenuLayout;
