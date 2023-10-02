import { useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import CreateEditMenuForm from './CreateEditMenuForm';

import css from './CreateEditMenuLayout.module.scss';

enum EEditPartnerMenuMobileStep {
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

  const isInfoTab = currStep === EEditPartnerMenuMobileStep.info;
  const isMealSettingsTab =
    currStep === EEditPartnerMenuMobileStep.mealSettings;

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
        <CreateEditMenuForm onSubmit={() => {}} />
      </div>

      <MobileBottomContainer>
        <div className={css.actionContainer}>
          <RenderWhen condition={isInfoTab}>
            <Button onClick={handleNavigateToNextStep}>Tiếp theo</Button>

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
