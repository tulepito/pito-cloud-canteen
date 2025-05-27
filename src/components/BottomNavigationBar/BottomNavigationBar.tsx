import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import NamedLink from '@components/NamedLink/NamedLink';
import { participantPaths } from '@src/paths';

import css from './BottomNavigationBar.module.scss';

const BottomNavigationBar = () => {
  const router = useRouter();
  const intl = useIntl();

  return (
    <div className={css.container}>
      <NamedLink path={participantPaths.OrderList} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: router.pathname === participantPaths.OrderList,
          })}>
          <IconCalendar />
          <div className={css.label}>
            {intl.formatMessage({
              id: 'GeneralLayoutTopBar.menuItem.myCalender',
            })}
          </div>
        </div>
      </NamedLink>
      <NamedLink
        path={participantPaths.SubOrderList}
        className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: router.pathname === participantPaths.SubOrderList,
          })}>
          <IconFood />
          <div className={css.label}>
            {intl.formatMessage({
              id: 'GeneralLayoutTopBar.menuItem.myOrders',
            })}
          </div>
        </div>
      </NamedLink>
      <NamedLink path={participantPaths.Account} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: router.pathname === participantPaths.Account,
          })}>
          <IconUser />
          <div className={css.label}>
            {intl.formatMessage({
              id: 'EditPartnerMenuWizard.informationTabLabel',
            })}
          </div>
        </div>
      </NamedLink>
    </div>
  );
};

export default BottomNavigationBar;
