/* eslint-disable no-nested-ternary */
import Button from '@components/Button/Button';
import { ENavigate } from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import type { TObject } from '@utils/types';
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
  localizer: TObject;
  onNavigate: (action: string) => void;
  onView: (name: string) => void;
  companyLogo?: ReactNode;
  startDate: number;
  endDate: number;
  date: Date;
};

const Toolbar: React.FC<TToolbarProps> = ({
  label,
  onNavigate,
  startDate,
  endDate,
  date,
}) => {
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
      <div className={css.actions}>
        <Button variant="secondary" className={css.secondaryBtn}>
          <IconRefreshing />
          {intl.formatMessage({
            id: 'Booker.CreateOrder.Toolbar.suggestNewRestaurant',
          })}
        </Button>
        <Button variant="cta">
          {intl.formatMessage({ id: 'Booker.CreateOrder.Toolbar.finish' })}
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
