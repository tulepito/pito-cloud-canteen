// eslint-disable-next-line import/no-named-as-default
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconBell from '@components/Icons/IconBell/IconBell';
import IconMail from '@components/Icons/IconMail/IconMail';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useLogout } from '@hooks/useLogout';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';

import PartnerNotificationModal from './PartnerNotificationModal';

import css from './PartnerHeader.module.scss';

type TPartnerHeaderProps = {
  onMenuClick: () => void;
};

const PartnerHeader: React.FC<TPartnerHeaderProps> = () => {
  const currentUser = useAppSelector(currentUserSelector);
  const notifications = useAppSelector(
    (state) => state.Notification.notifications,
  );
  const router = useRouter();
  const handleLogoutFn = useLogout();
  const tooltipController = useBoolean();

  const currentUserGetter = CurrentUser(currentUser);
  const { lastName = '', firstName = '' } = currentUserGetter.getProfile();
  const currentUserFullName = `${lastName} ${firstName}`;

  const newNotifications = notifications.filter((noti) => noti?.isNew === true);

  const onLogout = async () => {
    await handleLogoutFn();

    router.push('/');
  };

  const handleCloseTooltip = () => {
    tooltipController.setFalse();
  };

  return (
    <div className={css.root}>
      <div className={css.headerRight}>
        <PitoLogo className={css.logo} />
      </div>
      <div className={css.headerLeft}>
        <div className={css.actionContainer}>
          <InlineTextButton type="button">
            <IconMail className={css.iconMail} />
          </InlineTextButton>

          <Tooltip
            overlayClassName={classNames(css.tooltipOverlay)}
            placement="bottom"
            showArrow={false}
            trigger={'click'}
            visible={tooltipController.value}
            popupVisible={tooltipController.value}
            tooltipContent={
              <OutsideClickHandler onOutsideClick={handleCloseTooltip}>
                <PartnerNotificationModal
                  handleCloseTooltip={handleCloseTooltip}
                />
              </OutsideClickHandler>
            }>
            <InlineTextButton
              type="button"
              className={css.notiIcon}
              onClick={() => tooltipController.setTrue()}>
              <IconBell className={css.iconBell} />
              <RenderWhen condition={newNotifications.length > 0}>
                <div className={css.notiDot}>{newNotifications.length}</div>
              </RenderWhen>
            </InlineTextButton>
          </Tooltip>
        </div>
        <div className={css.line}></div>
        <ProfileMenu>
          <ProfileMenuLabel className={css.profileMenuWrapper}>
            <div className={css.avatar}>
              <Avatar disableProfileLink user={currentUser} />
            </div>
            <p className={css.displayName}>{currentUserFullName}</p>
            <IconArrow direction="down" />
          </ProfileMenuLabel>
          <ProfileMenuContent className={css.profileMenuContent}>
            <ProfileMenuItem key="AccountSettingsPage">
              <InlineTextButton type="button" onClick={onLogout}>
                <p>Đăng xuất</p>
              </InlineTextButton>
            </ProfileMenuItem>
          </ProfileMenuContent>
        </ProfileMenu>
      </div>
    </div>
  );
};

export default PartnerHeader;
