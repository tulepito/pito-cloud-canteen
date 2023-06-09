import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import NamedLink from '@components/NamedLink/NamedLink';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import { useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';

import css from './GeneralLayoutTopBar.module.scss';

const GeneralLayoutTopBar = () => {
  const router = useRouter();
  const intl = useIntl();
  const handleLogoutFn = useLogout();
  const currentUser = useAppSelector(currentUserSelector);

  const handleLogout = async () => {
    await handleLogoutFn();
    router.push('/');
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
          <NamedLink path={participantPaths.SubOrderList}>
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
            <ProfileMenuItem key="AccountSettingsPage">
              <InlineTextButton type="button" onClick={handleLogout}>
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
