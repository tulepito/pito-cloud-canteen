/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import { OwnListing } from '@src/utils/data';

import { IS_PARTNER_PROFILE_EDITABLE } from './account/helpers/constants';
import MediaForm from './components/MediaForm';
import { PartnerSettingsThunks } from './PartnerSettings.slice';

import css from './PartnerSettingsPage.module.scss';

const PartnerSettingsPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const handleLogoutFn = useLogout();
  const currentUser = useAppSelector(currentUserSelector);
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );

  const { title } = OwnListing(restaurantListing).getAttributes();

  const handleNavigateToAccountSettingsPage = () => {
    router.push(partnerPaths.AccountSettings);
  };

  const openChangePasswordModal = () => {
    router.push(partnerPaths.ChangePassword);
  };

  const handleNavigateToRestaurantSettingsPage = () => {
    router.push(partnerPaths.RestaurantSettings);
  };

  useEffect(() => {
    if (currentUser === null) return;

    dispatch(PartnerSettingsThunks.loadData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(currentUser)]);

  return (
    <div className={css.container}>
      <MediaForm disabled={!IS_PARTNER_PROFILE_EDITABLE} />
      <div className={css.title}>{title}</div>
      <div className={css.navigationWrapper}>
        <div
          className={css.navigationItem}
          onClick={handleNavigateToAccountSettingsPage}>
          <div className={css.iconGroup}>
            <IconUser />
            <span>Cài đặt tài khoản</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div
          className={css.navigationItem}
          onClick={handleNavigateToRestaurantSettingsPage}>
          <div className={css.iconGroup}>
            <IconFood />
            <span>Cài đặt nhà hàng</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.navigationItem} onClick={openChangePasswordModal}>
          <div className={css.iconGroup}>
            <IconLock />
            <span>Đổi mật khẩu</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.navigationItem} onClick={handleLogoutFn}>
          <div className={css.iconGroup}>
            <IconLogout />
            <span>Đăng xuất</span>
          </div>
          <IconArrow direction="right" />
        </div>
      </div>
    </div>
  );
};

export default PartnerSettingsPage;
