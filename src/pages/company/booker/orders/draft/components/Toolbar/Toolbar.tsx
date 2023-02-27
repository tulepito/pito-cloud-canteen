/* eslint-disable no-nested-ternary */
import Button from '@components/Button/Button';
import { ENavigate } from '@components/CalendarDashboard/helpers/constant';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import type { TObject } from '@utils/types';
import type { ReactNode } from 'react';
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
};

const Toolbar: React.FC<TToolbarProps> = (props) => {
  const { label, onNavigate } = props;
  const intl = useIntl();

  const navigateFunc = (action: string) => () => {
    onNavigate(action);
  };

  return (
    <div className={css.root}>
      <div className={css.actions}>
        <div className={css.toolbarNavigation}>
          <div
            className={css.arrowBtn}
            onClick={navigateFunc(ENavigate.PREVIOUS)}>
            <IconArrow className={css.arrowIcon} direction="left" />
          </div>
          {label}
          <div className={css.arrowBtn} onClick={navigateFunc(ENavigate.NEXT)}>
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
