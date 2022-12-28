import Button from '@components/Button/Button';
import IconArrow from '@components/IconArrow/IconArrow';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

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
};

const Toolbar: React.FC<TToolbarProps> = ({
  label,
  view,
  views,
  onNavigate,
  onView,
  companyLogo,
}) => {
  const intl = useIntl();

  const navigateFunc = (action: string) => () => {
    onNavigate(action);
  };

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
  };

  return (
    <div className={css.root}>
      <div className={css.label}>{label}</div>
      <div className={css.companyId}>{companyLogo}</div>
      <div className={css.actions}>
        <div className={css.viewModeGroup}>{viewNamesGroupFunc()}</div>
        <Button className={css.todayBtn} onClick={navigateFunc(NAVIGATE.TODAY)}>
          <FormattedMessage id="Toolbar.action.today" />
        </Button>
        <div className={css.arrowBtn} onClick={navigateFunc(NAVIGATE.PREVIOUS)}>
          <IconArrow className={css.arrowIcon} direction="left" />
        </div>
        <div className={css.arrowBtn} onClick={navigateFunc(NAVIGATE.NEXT)}>
          <IconArrow className={css.arrowIcon} direction="right" />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
