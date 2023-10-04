/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
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
}: {
  draftMenu: TObject;
  initialValues: TObject;
  currStep: EEditPartnerMenuMobileStep;
  isCreateFlow: boolean;
}) => {
  const {
    menuName,
    mealType,
    mealTypes = [],
    startDate,
    endDate,
  } = draftMenu || {};
  const isDraftDataValid =
    !isEmpty(menuName) &&
    menuName?.length <= MAX_MENU_LENGTH &&
    !isEmpty(isCreateFlow ? mealTypes : mealType) &&
    typeof startDate === 'number' &&
    typeof endDate === 'number';

  const enableNext = isDraftDataValid;
  let enableSubmit = false;

  switch (currStep) {
    case EEditPartnerMenuMobileStep.info: {
      enableSubmit =
        isDraftDataValid &&
        (isCreateFlow ||
          menuName !== initialValues.menuName ||
          isEqual(mealTypes, initialValues.mealTypes) ||
          startDate !== initialValues.startDate ||
          endDate !== initialValues.endDate);
      break;
    }
    case EEditPartnerMenuMobileStep.mealSettings: {
      break;
    }
    default:
      break;
  }

  return { enableNext, enableSubmit };
};

type TCreateEditMenuLayoutProps = {};

const CreateEditMenuLayout: React.FC<TCreateEditMenuLayoutProps> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
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

  const infoSubmitting = createDraftMenuInProgress;
  const initialValues = useMemo(
    () => ({
      menuName: title,
      startDate,
      endDate,
      mealType,
      foodsByDate,
    }),
    [
      title,
      endDate?.toString(),
      startDate?.toString(),
      mealType,
      JSON.stringify(foodsByDate),
      JSON.stringify(mealTypes),
    ],
  );
  const { enableNext, enableSubmit } = useMemo(
    () => verifyData({ draftMenu, initialValues, currStep, isCreateFlow }),
    [
      JSON.stringify(initialValues),
      JSON.stringify(draftMenu),
      isDraftEditFlow,
      isCreateFlow,
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

  const handleNavigateToNextStep = async () => {
    if (isInfoTab && enableSubmit && !infoSubmitting) {
      if (isCreateFlow) {
        const { meta, payload } = await dispatch(
          PartnerManageMenusThunks.createDraftMenu(),
        );

        if (meta.requestStatus === 'fulfilled') {
          historyPushState('menuId', payload.id.uuid);
        }
      }
    }

    if (enableNext) {
      setCurrStep(EEditPartnerMenuMobileStep.mealSettings);
    }
  };

  const handleNavigateToPrevStep = () => {
    if (isMealSettingsTab) {
      setCurrStep(EEditPartnerMenuMobileStep.info);
    }
  };

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <IconArrow direction="left" />

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

      <MobileBottomContainer>
        <div className={css.actionContainer}>
          <RenderWhen condition={isInfoTab}>
            <Button
              inProgress={infoSubmitting}
              disabled={!enableNext}
              onClick={handleNavigateToNextStep}>
              Tiếp theo
            </Button>

            <RenderWhen.False>
              <Button>Hoàn tất</Button>
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
        </div>
      </MobileBottomContainer>
    </div>
  );
};

export default CreateEditMenuLayout;
