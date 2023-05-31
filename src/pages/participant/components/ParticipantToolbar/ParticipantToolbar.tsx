import type { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import {
  ENavigate,
  EViewMode,
} from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import type { TObject } from '@utils/types';

import css from './ParticipantToolbar.module.scss';

export type TToolbarProps = {
  view: string;
  views: string[];
  label: ReactNode;
  localizer: TObject;
  onNavigate: (action: string) => void;
  onView: (name: string) => void;
  companyLogo?: ReactNode;
  recommendButton?: ReactNode;
  startDate: Date;
  endDate: Date;
  anchorDate: Date;
  onPickForMe?: () => void;
  onPickForMeLoading?: boolean;
  isAllowChangePeriod?: boolean;
};

const ParticipantToolbar: React.FC<TToolbarProps> = (props) => {
  const {
    label,
    onNavigate,
    recommendButton,
    startDate,
    endDate,
    anchorDate,
    onView,
    views,
    view,
    isAllowChangePeriod = false,
  } = props;
  const intl = useIntl();
  const startDateDateTime = DateTime.fromJSDate(startDate);
  const endDateDateTime = DateTime.fromJSDate(endDate);
  const anchorDateDateTime = DateTime.fromJSDate(anchorDate);
  const navigateFunc = (action: string) => () => {
    onNavigate(action);
  };

  const showPrevBtn =
    isAllowChangePeriod ||
    (view === EViewMode.WEEK &&
      startDateDateTime.weekNumber !== anchorDateDateTime.weekNumber) ||
    (view === EViewMode.MONTH &&
      startDateDateTime.monthLong !== anchorDateDateTime.monthLong);
  const showNextBtn =
    isAllowChangePeriod ||
    (view === EViewMode.WEEK &&
      endDateDateTime.weekNumber !== anchorDateDateTime.weekNumber) ||
    (view === EViewMode.MONTH &&
      endDateDateTime.monthLong !== anchorDateDateTime.monthLong);

  const viewFunc = (viewName: string) => () => {
    onView(viewName);
    localStorage.setItem('participant_calendarView', viewName);
  };

  const viewNamesGroupFunc = () => {
    if (views.length > 1) {
      return views.map((name) => (
        <Button
          key={name}
          className={classNames(css.viewMode, {
            [css.activeViewMode]: view === name,
          })}
          onClick={viewFunc(name)}>
          {intl.formatMessage({
            id: `Toolbar.viewMode.${name}`,
          })}
        </Button>
      ));
    }

    return <div></div>;
  };

  return (
    <div className={css.root}>
      {/* <Button
        className={css.pickForMeBtn}
        variant="secondary"
        onClick={onPickForMe}>
        <IconRefreshing inProgress={onPickForMeLoading} />
        <FormattedMessage id="Toolbar.action.pickForMe" />
      </Button> */}
      <div className={css.actions}>
        <div className={css.btnGroup}>
          {views.length > 1 ? (
            <div className={css.viewModeGroup}>{viewNamesGroupFunc()}</div>
          ) : (
            <div />
          )}

          <div className={css.todayBtn} onClick={navigateFunc(ENavigate.TODAY)}>
            <FormattedMessage id="Toolbar.action.today" />
          </div>
        </div>
        <div className={css.toolbarNavigation}>
          <div
            className={classNames(css.arrowBtn, !showPrevBtn && css.disabled)}
            onClick={navigateFunc(ENavigate.PREVIOUS)}>
            <IconArrow className={css.arrowIcon} direction="left" />
          </div>
          {label}
          <div
            className={classNames(css.arrowBtn, !showNextBtn && css.disabled)}
            onClick={navigateFunc(ENavigate.NEXT)}>
            <IconArrow className={css.arrowIcon} direction="right" />
          </div>
        </div>
      </div>
      {recommendButton}
    </div>
  );
};

export default ParticipantToolbar;
