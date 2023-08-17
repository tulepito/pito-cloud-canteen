import classNames from 'classnames';
import { useRouter } from 'next/router';

import IconCategory from '@components/Icons/IconCategory/IconCategory';
import IconHome from '@components/Icons/IconHome/IconHome';
import IconMoreSquare from '@components/Icons/IconMoreSquare/IconMoreSquare';
import IconOrderManagement from '@components/Icons/IconOrderManagement/IconOrderManagement';
import NamedLink from '@components/NamedLink/NamedLink';
import { partnerPaths } from '@src/paths';

import css from './PartnerNavBar.module.scss';

const PartnerNavBar = () => {
  const router = useRouter();

  return (
    <div className={css.container}>
      <NamedLink path={partnerPaths.Home} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: router.pathname === partnerPaths.Home,
          })}>
          <IconHome className={css.icon} />
          <div className={css.label}>Tổng quan</div>
        </div>
      </NamedLink>

      <NamedLink path={partnerPaths.ManageOrders} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: router.pathname === partnerPaths.ManageOrders,
          })}>
          <IconOrderManagement className={css.icon} />
          <div className={css.label}>Đơn hàng</div>
        </div>
      </NamedLink>

      <NamedLink path={partnerPaths.ManageProduct} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: router.pathname === partnerPaths.ManageProduct,
          })}>
          <IconCategory className={css.icon} />
          <div className={css.label}>Sản phẩm</div>
        </div>
      </NamedLink>

      <NamedLink path={partnerPaths.Settings} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: router.pathname === partnerPaths.Settings,
          })}>
          <IconMoreSquare className={css.icon} />
          <div className={css.label}>Thêm</div>
        </div>
      </NamedLink>
    </div>
  );
};

export default PartnerNavBar;
