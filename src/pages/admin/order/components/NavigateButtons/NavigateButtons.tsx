import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { getItem } from '@helpers/localStorageHelpers';

// eslint-disable-next-line import/no-cycle
import {
  CREATE_ORDER_STEP_LOCAL_STORAGE_NAME,
  REVIEW_TAB,
} from '../../create/components/CreateOrderWizard/CreateOrderWizard';

import css from './NavigateButtons.module.scss';

export enum EFlowType {
  createOrEditDraft = 'createOrEditDraft',
  edit = 'edit',
}
type TNavigateButtons = {
  goBack?: () => void;
  onNextClick?: () => void;
  onCompleteClick?: () => void;
  submitDisabled?: boolean;
  inProgress?: boolean;
  flowType?: EFlowType;
};

const NavigateButtons: React.FC<TNavigateButtons> = (props) => {
  const {
    goBack,
    onNextClick,
    onCompleteClick,
    inProgress,
    submitDisabled = false,
    flowType = EFlowType.createOrEditDraft,
  } = props;

  const step = getItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME);

  const isCreateOrEditDraftFlow = flowType === EFlowType.createOrEditDraft;

  return (
    <div className={css.navigationBtn}>
      <RenderWhen condition={isCreateOrEditDraftFlow}>
        <Button
          type="submit"
          className={css.nextButton}
          inProgress={inProgress}
          disabled={submitDisabled}
          onClick={onNextClick || undefined}>
          {step === REVIEW_TAB ? (
            <FormattedMessage id="NavigateButtons.complete" />
          ) : (
            <FormattedMessage id="NavigateButtons.continue" />
          )}
        </Button>

        <RenderWhen.False>
          <div className={css.actionWrapper}>
            <Button
              className={css.button}
              variant="secondary"
              inProgress={inProgress}
              disabled={submitDisabled}
              onClick={onNextClick}>
              <FormattedMessage id="NavigateButtons.continue" />
            </Button>
            <Button
              className={css.button}
              inProgress={inProgress}
              disabled={submitDisabled}
              onClick={onCompleteClick}>
              <FormattedMessage id="NavigateButtons.complete" />
            </Button>
          </div>
        </RenderWhen.False>
      </RenderWhen>
      {goBack && (
        <Button variant="secondary" onClick={goBack} type="button">
          <FormattedMessage id="NavigateButtons.goBack" />
        </Button>
      )}
    </div>
  );
};

export default NavigateButtons;
