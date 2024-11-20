import React from 'react';

import css from './FullScreenPageLoading.module.scss';

const FullScreenPageLoading = () => {
  return (
    <div className={css.spinnerWrapper}>
      <div className={css.skFoldingCube}>
        <div className={`${css.skCube} ${css.skCube1}`}></div>
        <div className={`${css.skCube} ${css.skCube2}`}></div>
        <div className={`${css.skCube} ${css.skCube4}`}></div>
        <div className={`${css.skCube} ${css.skCube3}`}></div>
      </div>
    </div>
  );
};

export default FullScreenPageLoading;
