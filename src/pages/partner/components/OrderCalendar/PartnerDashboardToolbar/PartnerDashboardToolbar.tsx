import type { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import { ENavigate } from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './PartnerDashboardToolbar.module.scss';

type TPartnerDashboardToolbarProps = {
  view: string;
  views: string[];
  label: ReactNode;
  onNavigate: (action: string) => void;
  onView: (name: string) => void;
  startDate: Date;
  endDate: Date;
  anchorDate: Date;
  hidePrevNavButton?: boolean;
  hideNextNavButton?: boolean;
};

const PartnerDashboardToolbar: React.FC<TPartnerDashboardToolbarProps> = (
  props,
) => {
  const {
    label,
    onNavigate,
    startDate,
    endDate,
    anchorDate,
    onView,
    views,
    view,
    hidePrevNavButton = false,
    hideNextNavButton = false,
  } = props;
  const intl = useIntl();
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
        <Button
          className={css.todayBtn}
          onClick={navigateFunc(ENavigate.TODAY)}>
          <FormattedMessage id="Toolbar.action.today" />
        </Button>
        <div className={css.toolbarNavigation}>
          <RenderWhen condition={!hidePrevNavButton}>
            <div
              className={classNames(css.arrowBtn, !showPrevBtn && css.disabled)}
              onClick={navigateFunc(ENavigate.PREVIOUS)}>
              <IconArrow className={css.arrowIcon} direction="left" />
            </div>
          </RenderWhen>
          {label}
          <RenderWhen condition={!hideNextNavButton}>
            <div
              className={classNames(css.arrowBtn, !showNextBtn && css.disabled)}
              onClick={navigateFunc(ENavigate.NEXT)}>
              <IconArrow className={css.arrowIcon} direction="right" />
            </div>
          </RenderWhen>
        </div>
      </div>
      <RenderWhen condition={Object.keys(views).length > 1}>
        <div className={css.viewModeGroup}>{viewNamesGroupFunc()}</div>
      </RenderWhen>
    </div>
  );
};

export default PartnerDashboardToolbar;
