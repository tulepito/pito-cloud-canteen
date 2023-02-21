/* eslint-disable no-nested-ternary */
import Button from '@components/Button/Button';
import { NAVIGATE } from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { ReactNode } from 'react';
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
  startDate: Date;
  endDate: Date;
  date: Date;
  onFinishOrder: () => void;
};

const Toolbar: React.FC<TToolbarProps> = (props) => {
  const { label, onNavigate, startDate, endDate, date, onFinishOrder } = props;
  const intl = useIntl();
  const startDateDateTime = DateTime.fromJSDate(startDate);
  const endDateDateTime = DateTime.fromJSDate(endDate);
  const anchorDateDateTime = DateTime.fromJSDate(date);
  const showPrevBtn =
    startDateDateTime.weekNumber !== anchorDateDateTime.weekNumber;
  const showNextBtn =
    endDateDateTime.weekNumber !== anchorDateDateTime.weekNumber;

  const navigateFunc = (action: string) => () => {
    onNavigate(action);
  };

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
        <Button variant="cta" onClick={onFinishOrder} disabled>
          {intl.formatMessage({ id: 'Booker.CreateOrder.Toolbar.finish' })}
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
