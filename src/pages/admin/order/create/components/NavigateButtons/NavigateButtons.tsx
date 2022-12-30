import Button from '@components/Button/Button';
import React from 'react';

import css from './NavigateButtons.module.scss';

type TNavigateButtons = {
  goBack: () => void;
};

const NavigateButtons: React.FC<TNavigateButtons> = (props) => {
  const { goBack } = props;
  return (
    <div className={css.navigationBtn}>
      <Button onClick={goBack} type="button" className={css.backButton}>
        Trở về
      </Button>
      <Button type="submit" className={css.nextButton}>
        Hoàn tất
      </Button>
    </div>
  );
};

export default NavigateButtons;
