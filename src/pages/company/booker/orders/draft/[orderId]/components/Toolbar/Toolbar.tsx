/* eslint-disable no-nested-ternary */
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import { ENavigate } from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TObject } from '@utils/types';

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
  finishInProgress: boolean;
  finishDisabled: boolean;
  onFinishOrder: () => void;
  onRecommendRestaurantInProgress: boolean;
  onRecommendNewRestaurants: () => void;
  shouldHideExtraActionBtn?: boolean;
};

const Toolbar: React.FC<TToolbarProps> = (props) => {
  const {
    label,
    onNavigate,
    startDate,
    endDate,
    date,
    finishDisabled,
    finishInProgress,
    onFinishOrder,
    onRecommendRestaurantInProgress,
    onRecommendNewRestaurants,
    shouldHideExtraActionBtn = false,
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
      <RenderWhen condition={!shouldHideExtraActionBtn}>
        <div className={css.actions}>
          <Button
            variant="secondary"
            className={css.secondaryBtn}
            onClick={onRecommendNewRestaurants}>
            <IconRefreshing inProgress={onRecommendRestaurantInProgress} />
            {intl.formatMessage({
              id: 'Booker.CreateOrder.Toolbar.suggestNewRestaurant',
            })}
          </Button>
          <Button
            variant="cta"
            onClick={onFinishOrder}
            disabled={finishDisabled}
            loadingMode="extend"
            inProgress={finishInProgress}>
            {intl.formatMessage({ id: 'Booker.CreateOrder.Toolbar.finish' })}
          </Button>
        </div>
        <RenderWhen.False>
          <div className={css.bottomBtns}>
            <Button
              variant="secondary"
              className={css.secondaryBtn}
              onClick={onRecommendNewRestaurants}>
              <IconRefreshing
                className={css.refreshIcon}
                inProgress={onRecommendRestaurantInProgress}
              />
              {intl.formatMessage({
                id: 'Booker.CreateOrder.Toolbar.suggestNewRestaurant',
              })}
            </Button>
            <Button
              variant="cta"
              className={css.ctaBtn}
              onClick={onFinishOrder}
              disabled={finishDisabled}
              loadingMode="extend"
              inProgress={finishInProgress}>
              {intl.formatMessage({ id: 'Booker.CreateOrder.Toolbar.finish' })}
            </Button>
          </div>
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default Toolbar;
