import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconSwap from '@components/Icons/IconSwap/IconSwap';
import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import Tracker from '@helpers/tracker';
import { useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import { currentUserSelector } from '@redux/slices/user.slice';
import { enGeneralPaths, participantPaths } from '@src/paths';

import css from './GeneralLayoutTopBar.module.scss';

const GeneralLayoutTopBar = () => {
  const router = useRouter();
  const intl = useIntl();
  const handleLogoutFn = useLogout();
  const currentUser = useAppSelector(currentUserSelector);
  const { onOpenRoleSelectModal } = useRoleSelectModalController();
  const roles = useAppSelector((state) => state.user.roles);

  const shouldShowChangeRoleOption = roles.length > 1;

  const handleLogout = async () => {
    await handleLogoutFn();
    router.push(enGeneralPaths.Auth);
  };

  return (
    <div className={css.root}>
      <NamedLink className={css.headerLeft} path={participantPaths.OrderList}>
        <PitoLogo variant="secondary" className={css.logo} />
      </NamedLink>
      <div className={css.headerRight}>
        <div className={css.menuItemList}>
          <NamedLink path={participantPaths.OrderList}>
            <div className={css.menuItem}>
              {intl.formatMessage({
                id: 'GeneralLayoutTopBar.menuItem.myCalender',
              })}
            </div>
          </NamedLink>
          <NamedLink
            onClick={() => {
              Tracker.track('participant:foods:view', {});
            }}
            path={participantPaths.SubOrderList}>
            <div className={css.menuItem}>
              {intl.formatMessage({
                id: 'GeneralLayoutTopBar.menuItem.myOrders',
              })}
            </div>
          </NamedLink>
          <NamedLink path={participantPaths.Account}>
            <div className={css.menuItem}>
              {intl.formatMessage({
                id: 'GeneralLayoutTopBar.menuItem.account',
              })}
            </div>
          </NamedLink>
        </div>
        <div className={css.divider} />

        <ProfileMenu>
          <ProfileMenuLabel className={css.profileMenuWrapper}>
            <div className={css.avatar}>
              <Avatar disableProfileLink user={currentUser} />
            </div>
          </ProfileMenuLabel>
          <ProfileMenuContent className={css.profileMenuContent}>
            {shouldShowChangeRoleOption && (
              <ProfileMenuItem
                key="ChangeRole"
                className={css.menuItem}
                onClick={onOpenRoleSelectModal}>
                <IconSwap />
                <div className={css.text}>Đổi vai trò</div>
              </ProfileMenuItem>
            )}
            <ProfileMenuItem key="Logout" className={css.menuItem}>
              <IconLogout className={css.logoutIcon} />
              <InlineTextButton
                type="button"
                onClick={handleLogout}
                className={css.logout}>
                <p>Đăng xuất</p>
              </InlineTextButton>
            </ProfileMenuItem>
          </ProfileMenuContent>
        </ProfileMenu>
      </div>
    </div>
  );
};

export default GeneralLayoutTopBar;
