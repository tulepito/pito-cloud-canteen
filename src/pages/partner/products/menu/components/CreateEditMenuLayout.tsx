import { useMemo, useState } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import type { TObject } from '@src/utils/types';

import CreateEditMenuForm, { MAX_MENU_LENGTH } from './CreateEditMenuForm';

import css from './CreateEditMenuLayout.module.scss';

const verifyDraftData = (data: TObject, isDraftEditFlow = false) => {
  const { menuName, menuTypes = [], startDate, endDate } = data || {};

  return isDraftEditFlow
    ? !isEmpty(menuName) &&
        menuName?.length <= MAX_MENU_LENGTH &&
        !isEmpty(menuTypes) &&
        typeof startDate === 'number' &&
        typeof endDate === 'number'
    : true;
};

export enum EEditPartnerMenuMobileStep {
  info = 'info',
  mealSettings = 'mealSettings',
}

type TCreateEditMenuLayoutProps = {};

const CreateEditMenuLayout: React.FC<TCreateEditMenuLayoutProps> = () => {
  const router = useRouter();

  const {
    query: { menuId },
    isReady: isRouterReady,
  } = router;

  const [currStep, setCurrStep] = useState(EEditPartnerMenuMobileStep.info);
  const menu = useAppSelector((state) => state.PartnerManageMenus.menu);
  const draftMenu = useAppSelector(
    (state) => state.PartnerManageMenus.draftMenu,
  );

  const isDraftEditFlow = menu === null;

  const isInfoTab = currStep === EEditPartnerMenuMobileStep.info;
  const isMealSettingsTab =
    currStep === EEditPartnerMenuMobileStep.mealSettings;

  const enableInfoTabNextBtn = useMemo(
    () => verifyDraftData(draftMenu, isDraftEditFlow),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(draftMenu), isDraftEditFlow],
  );
  const infoNumberClasses = classNames(css.stepNumber, {
    [css.stepNumberActive]: isInfoTab,
  });
  const mealSettingsNumberClasses = classNames(css.stepNumber, {
    [css.stepNumberActive]: isMealSettingsTab,
  });

  const infoStepInfoClasses = classNames({
    [css.stepInfoActive]: isInfoTab,
  });
  const mealSettingsStepInfoClasses = classNames({
    [css.stepInfoActive]: isMealSettingsTab,
  });

  const handleNavigateToNextStep = () => {
    if (isInfoTab) {
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
          {menuId ? 'Chỉnh sửa menu' : 'Tạo menu'}
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

      <div className={css.contentContainer}>
        <CreateEditMenuForm
          isMealSettingsTab={isMealSettingsTab}
          onSubmit={() => {}}
        />
      </div>

      <MobileBottomContainer>
        <div className={css.actionContainer}>
          <RenderWhen condition={isInfoTab}>
            <Button
              disabled={!enableInfoTabNextBtn}
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
        </div>
      </MobileBottomContainer>
    </div>
  );
};

export default CreateEditMenuLayout;
