/* eslint-disable no-nested-ternary */
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { ReactNode } from 'react';

import { NAVIGATE } from '../../helpers/constant';
import css from './Toolbar.module.scss';

export type TToolbarProps = {
  view: string;
  views: string[];
  label: ReactNode;
  localizer: Record<string, any>;
  onNavigate: (action: string) => void;
  onView: (name: string) => void;
  companyLogo?: ReactNode;
  recommendButton?: ReactNode;
  startDate: Date;
  endDate: Date;
  anchorDate: Date;
};

const Toolbar: React.FC<TToolbarProps> = (props) => {
  const { label, onNavigate, recommendButton, startDate, endDate, anchorDate } =
    props;

  const startDateDateTime = DateTime.fromJSDate(startDate);
  const endDateDateTime = DateTime.fromJSDate(endDate);
  const anchorDateDateTime = DateTime.fromJSDate(anchorDate);
  const navigateFunc = (action: string) => () => {
    onNavigate(action);
  };
  const showPrevBtn =
    startDateDateTime.weekNumber !== anchorDateDateTime.weekNumber;
  const showNextBtn =
    endDateDateTime.weekNumber !== anchorDateDateTime.weekNumber;

  return (
    <div className={css.root}>
      <div className={css.actions}>
        <div className={css.toolbarNavigation}>
          <div
            className={classNames(css.arrowBtn, !showPrevBtn && css.disabled)}
            onClick={navigateFunc(NAVIGATE.PREVIOUS)}>
            <IconArrow className={css.arrowIcon} direction="left" />
          </div>
          {label}
          <div
            className={classNames(css.arrowBtn, !showNextBtn && css.disabled)}
            onClick={navigateFunc(NAVIGATE.NEXT)}>
            <IconArrow className={css.arrowIcon} direction="right" />
          </div>
        </div>
      </div>
      {recommendButton}
    </div>
  );
};

export default Toolbar;
