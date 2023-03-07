/* eslint-disable no-nested-ternary */
import type { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import type { TObject } from '@utils/types';

import { ENavigate } from '../../helpers/constant';

import css from './Toolbar.module.scss';

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
};

const Toolbar: React.FC<TToolbarProps> = (props) => {
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
  } = props;
  const intl = useIntl();
  const shouldShowNavigateToday = false;
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

  const viewFunc = (viewName: string) => () => {
    onView(viewName);
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
      <div className={css.actions}>
        {views.length > 1 ? (
          <div className={css.viewModeGroup}>{viewNamesGroupFunc()}</div>
        ) : (
          <div />
        )}
        {shouldShowNavigateToday && (
          <Button
            className={css.todayBtn}
            onClick={navigateFunc(ENavigate.TODAY)}>
            <FormattedMessage id="Toolbar.action.today" />
          </Button>
        )}
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

export default Toolbar;
