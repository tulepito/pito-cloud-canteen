import classNames from 'classnames';
import { useRouter } from 'next/router';

import IconBorderStar from '@components/Icons/IconBorderStar/IconBorderStar';
import IconCategory from '@components/Icons/IconCategory/IconCategory';
import IconGraph from '@components/Icons/IconGraph/IconGraph';
import IconHome from '@components/Icons/IconHome/IconHome';
import IconMoreSquare from '@components/Icons/IconMoreSquare/IconMoreSquare';
import IconOrderManagement from '@components/Icons/IconOrderManagement/IconOrderManagement';
import IconSetting from '@components/Icons/IconSetting/IconSetting';
import IconWallet from '@components/Icons/IconWallet/IconWallet';
import NamedLink from '@components/NamedLink/NamedLink';
import SlideModal from '@components/SlideModal/SlideModal';
import useBoolean from '@hooks/useBoolean';
import { partnerPaths } from '@src/paths';

import css from './PartnerNavBar.module.scss';

const PartnerNavBar = () => {
  const { pathname } = useRouter();
  const moreItemsController = useBoolean();

  const isMoreItemActive = [
    partnerPaths.Settings,
    partnerPaths.ManagePayments,
    partnerPaths.ManageReviews,
  ].includes(pathname);

  const isProduceItemActive = [
    partnerPaths.ManageFood,
    partnerPaths.ManageMenus,
  ].includes(pathname);

  const handleCloseMoreItemsModal = () => moreItemsController.setFalse();
  const handleOpenMoreItemsModal = () => moreItemsController.setTrue();

  return (
    <div className={css.container}>
      <NamedLink path={partnerPaths.Home} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: pathname === partnerPaths.Home,
          })}>
          <IconHome className={css.icon} />
          <div className={css.label}>Tổng quan</div>
        </div>
      </NamedLink>

      <NamedLink path={partnerPaths.ManageOrders} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: pathname === partnerPaths.ManageOrders,
          })}>
          <IconOrderManagement className={css.icon} />
          <div className={css.label}>Đơn hàng</div>
        </div>
      </NamedLink>

      <NamedLink path={partnerPaths.ManageFood} className={css.itemWrapper}>
        <div
          className={classNames(css.item, {
            [css.active]: isProduceItemActive,
          })}>
          <IconCategory className={css.icon} />
          <div className={css.label}>Sản phẩm</div>
        </div>
      </NamedLink>

      <div className={css.itemWrapper} onClick={handleOpenMoreItemsModal}>
        <div
          className={classNames(css.item, {
            [css.active]: isMoreItemActive,
          })}>
          <IconMoreSquare className={css.icon} />
          <div className={css.label}>Thêm</div>
        </div>
      </div>

      <SlideModal
        id="PartnerNavBar.MoreItems"
        isOpen={moreItemsController.value}
        onClose={handleCloseMoreItemsModal}>
        <div className={css.menuContainer}>
          <span onClick={handleCloseMoreItemsModal}>
            <NamedLink
              path={partnerPaths.ManagePayments}
              className={css.itemRow}>
              <IconWallet className={css.itemIcon} />
              <div>Thanh toán</div>
            </NamedLink>
          </span>
          <span onClick={handleCloseMoreItemsModal}>
            <div className={css.itemRow}>
              <IconGraph className={css.itemIcon} />
              <div>Phân tích bán hàng</div>
            </div>
          </span>
          <span onClick={handleCloseMoreItemsModal}>
            <NamedLink
              path={partnerPaths.ManageReviews}
              className={css.itemRow}>
              <IconBorderStar className={css.itemIcon} />
              <div>Đánh giá</div>
            </NamedLink>
          </span>
          <span onClick={handleCloseMoreItemsModal}>
            <NamedLink path={partnerPaths.Settings} className={css.itemRow}>
              <IconSetting className={css.itemIcon} />
              <div>Cài đặt</div>
            </NamedLink>
          </span>
        </div>
      </SlideModal>
    </div>
  );
};

export default PartnerNavBar;
