/* eslint-disable no-nested-ternary */
import Button from '@components/Button/Button';
import { NAVIGATE } from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import css from './Toolbar.module.scss';

export type TToolbarProps = {
  view: string;
  views: string[];
  label: ReactNode;
  localizer: Record<string, any>;
  onNavigate: (action: string) => void;
  onView: (name: string) => void;
  companyLogo?: ReactNode;
  startDate: number;
  endDate: number;
  date: Date;
  finishInProgress: boolean;
  finishDisabled: boolean;
  onFinishOrder: () => void;
};

const Toolbar: React.FC<TToolbarProps> = (props) => {
  const {
    label,
    onNavigate,
    startDate,
    endDate,
    date,
    finishInProgress,
    finishDisabled,
    onFinishOrder,
  } = props;
  const intl = useIntl();
  const startDateDateTime = useMemo(
    () => DateTime.fromMillis(startDate),
    [startDate],
  );
  const endDateDateTime = useMemo(
    () => DateTime.fromMillis(endDate),
    [endDate],
  );
  const anchorDateDateTime = useMemo(() => DateTime.fromJSDate(date), [date]);

  const showPrevBtn = useMemo(() => {
    return startDateDateTime.weekNumber !== anchorDateDateTime.weekNumber;
  }, [startDateDateTime, anchorDateDateTime]);
  const showNextBtn = useMemo(() => {
    return endDateDateTime.weekNumber !== anchorDateDateTime.weekNumber;
  }, [endDateDateTime, anchorDateDateTime]);

  const navigateFunc = useCallback(
    (action: string) => () => {
      onNavigate(action);
    },
    [onNavigate],
  );

  return (
    <div className={css.root}>
      <div className={css.actions}>
        <div className={css.toolbarNavigation}>
          <div
            className={classNames(css.arrowBtn, {
              [css.disabled]: !showPrevBtn,
            })}
            onClick={navigateFunc(NAVIGATE.PREVIOUS)}>
            <IconArrow className={css.arrowIcon} direction="left" />
          </div>
          {label}
          <div
            className={classNames(css.arrowBtn, {
              [css.disabled]: !showNextBtn,
            })}
            onClick={navigateFunc(NAVIGATE.NEXT)}>
            <IconArrow className={css.arrowIcon} direction="right" />
          </div>
        </div>
      </div>
      <div className={css.actions}>
        <Button variant="secondary" className={css.secondaryBtn}>
          <IconRefreshing />
          {intl.formatMessage({
            id: 'Booker.CreateOrder.Toolbar.suggestNewRestaurant',
          })}
        </Button>
        <Button variant="cta" onClick={onFinishOrder} disabled={finishDisabled}>
          {intl.formatMessage({ id: 'Booker.CreateOrder.Toolbar.finish' })}
          {finishInProgress && <IconSpinner className={css.loadingIcon} />}
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
