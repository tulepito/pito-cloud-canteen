import classNames from 'classnames';
import { useRouter } from 'next/router';

import IconDocument from '@components/Icons/IconDocument/IconDocument';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconHome from '@components/Icons/IconHome/IconHome';
import IconUser2 from '@components/Icons/IconUser2/IconUser2';
import NamedLink from '@components/NamedLink/NamedLink';
import { companyPaths, personalPaths } from '@src/paths';

import css from './CompanyNavBar.module.scss';

type TCompanyNavBarProps = {};

const CompanyNavBar: React.FC<TCompanyNavBarProps> = () => {
  const router = useRouter();
  const { pathname } = router;
  const { companyId } = router.query;

  return (
    <div className={css.container}>
      <NamedLink
        path={companyPaths.Home}
        params={{ companyId: companyId as string }}
        className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: pathname === companyPaths.Home,
          })}>
          <IconHome className={css.icon} />
          <div className={css.label}>Trang chủ</div>
        </div>
      </NamedLink>

      <NamedLink path={companyPaths.CreateNewOrder} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: pathname === companyPaths.CreateNewOrder,
          })}>
          <IconFood className={css.icon} />
          <div className={css.label}>Đặt hàng</div>
        </div>
      </NamedLink>

      <NamedLink
        path={companyPaths.ManageOrders}
        params={{ companyId: companyId as string }}
        className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: pathname === companyPaths.ManageOrders,
          })}>
          <IconDocument className={css.icon} filled={false} />
          <div className={css.label}>Đơn hàng</div>
        </div>
      </NamedLink>
      <NamedLink
        path={personalPaths.Account}
        params={{ companyId: 'personal' as string }}
        className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: pathname === personalPaths.Account,
          })}>
          <IconUser2 className={css.icon} />
          <div className={css.label}>Tài khoản</div>
        </div>
      </NamedLink>
    </div>
  );
};

export default CompanyNavBar;
