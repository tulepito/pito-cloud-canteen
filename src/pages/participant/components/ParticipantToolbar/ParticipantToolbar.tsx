import { type ReactNode, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import {
  ENavigate,
  EViewMode,
} from '@components/CalendarDashboard/helpers/constant';
import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { setItem } from '@helpers/localStorageHelpers';
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
  onChangeDate?: (date: Date) => void;
  date?: Date;
  isAllowChangePeriod?: boolean;
};

const ParticipantToolbar: React.FC<TToolbarProps> = (props) => {
  const {
    label,
    onNavigate,
    onChangeDate,
    recommendButton,
    startDate,
    endDate,
    anchorDate,
    onView,
    views,
    view,
    date,
    isAllowChangePeriod = false,
  } = props;
  const intl = useIntl();
  const mountedRef = useRef(false);
  const shouldSetDateRef = useRef(false);
  const { selectedDay } = useSelectDay();

  const startDateDateTime = DateTime.fromJSDate(startDate);
  const endDateDateTime = DateTime.fromJSDate(endDate);
  const anchorDateDateTime = DateTime.fromJSDate(anchorDate);

  const navigateFunc = (action: string) => () => {
    onNavigate(action);
    shouldSetDateRef.current = true;
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
    setItem('participant_calendarView', viewName);
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

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (mountedRef.current && onChangeDate && shouldSetDateRef.current) {
      if (!isEqual(selectedDay, date) || selectedDay === null) {
        onChangeDate(date!);
        shouldSetDateRef.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(date), mountedRef.current]);

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
            className={classNames(css.arrowBtn, {
              [css.disabled]: !showPrevBtn,
            })}
            onClick={navigateFunc(ENavigate.PREVIOUS)}>
            <IconArrow className={css.arrowIcon} direction="left" />
          </div>
          {label}
          <div
            className={classNames(css.arrowBtn, {
              [css.disabled]: !showNextBtn,
            })}
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
