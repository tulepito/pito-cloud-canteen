import Button from '@components/Button/Button';
import { getItem } from '@utils/localStorageHelpers';
import React from 'react';
import { FormattedMessage } from 'react-intl';

// eslint-disable-next-line import/no-cycle
import {
  CREATE_ORDER_STEP_LOCAL_STORAGE_NAME,
  REVIEW_TAB,
} from '../CreateOrderWizard/CreateOrderWizard';
import css from './NavigateButtons.module.scss';

type TNavigateButtons = {
  goBack?: () => void;
  onNextClick?: () => void;
  inProgress?: boolean;
};

const NavigateButtons: React.FC<TNavigateButtons> = (props) => {
  const { goBack, onNextClick, inProgress } = props;

  const step = getItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME);

  return (
    <div className={css.navigationBtn}>
      <Button
        type="submit"
        className={css.nextButton}
        inProgress={inProgress}
        onClick={onNextClick || undefined}>
        {step === REVIEW_TAB ? (
          <FormattedMessage id="NavigateButtons.complete" />
        ) : (
          <FormattedMessage id="NavigateButtons.continue" />
        )}
      </Button>
      {goBack && (
        <Button onClick={goBack} type="button" className={css.backButton}>
          <FormattedMessage id="NavigateButtons.goBack" />
        </Button>
      )}
    </div>
  );
};

export default NavigateButtons;
