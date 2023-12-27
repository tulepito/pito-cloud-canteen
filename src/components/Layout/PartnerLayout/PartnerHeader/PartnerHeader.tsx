// eslint-disable-next-line import/no-named-as-default
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconBell from '@components/Icons/IconBell/IconBell';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import ProfileMenu from '@components/ProfileMenu/ProfileMenu';
import ProfileMenuContent from '@components/ProfileMenuContent/ProfileMenuContent';
import ProfileMenuItem from '@components/ProfileMenuItem/ProfileMenuItem';
import ProfileMenuLabel from '@components/ProfileMenuLabel/ProfileMenuLabel';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useLogout } from '@hooks/useLogout';
import { useViewport } from '@hooks/useViewport';
import {
  NotificationActions,
  NotificationThunks,
} from '@redux/slices/notification.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import { CurrentUser } from '@src/utils/data';

import PartnerNotificationModal from './PartnerNotificationModal';

import css from './PartnerHeader.module.scss';

type TPartnerHeaderProps = {
  onMenuClick: () => void;
};

const PartnerHeader: React.FC<TPartnerHeaderProps> = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);
  const notifications = useAppSelector(
    (state) => state.Notification.notifications,
  );
  const router = useRouter();
  const handleLogoutFn = useLogout();
  const partnerNotificationModalController = useBoolean();
  const { isMobileLayout } = useViewport();

  const currentUserGetter = CurrentUser(currentUser);
  const { lastName = '', firstName = '' } = currentUserGetter.getProfile();
  const currentUserFullName = `${lastName} ${firstName}`;

  const newNotificationIds = notifications.reduce(
    (ids, noti) => (noti?.isNew === true ? ids.concat(noti?.id) : ids),
    [],
  );
  const newNotificationIdsCount = newNotificationIds.length;

  const onLogout = async () => {
    await handleLogoutFn();

    router.push('/');
  };

  useEffect(() => {
    if (
      partnerNotificationModalController.value &&
      newNotificationIds.length > 0
    ) {
      dispatch(
        NotificationThunks.markAllNotificationsAreOld(newNotificationIds),
      );
      dispatch(
        NotificationActions.markAllNotificationsAreOld(newNotificationIds),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerNotificationModalController.value]);

  return (
    <div className={css.root}>
      <ProfileMenuLabel className={css.headerLeftMobile}>
        <div className={css.avatar}>
          <Avatar disableProfileLink user={currentUser} />
        </div>
        <p className={css.displayName}>{currentUserFullName}</p>
      </ProfileMenuLabel>

      <NamedLink path={partnerPaths.Home} className={css.headerRightWrapper}>
        <div className={css.headerRight}>
          <PitoLogo className={css.logo} />
        </div>
      </NamedLink>
      <div className={css.headerLeft}>
        <div className={css.actionContainer}>
          <InlineTextButton
            type="button"
            className={css.notiIcon}
            onClick={() => partnerNotificationModalController.setTrue()}>
            <IconBell className={css.iconBell} />
            <RenderWhen condition={newNotificationIdsCount > 0}>
              <div className={css.notiDot}>{newNotificationIdsCount}</div>
            </RenderWhen>
          </InlineTextButton>
          <OutsideClickHandler
            onOutsideClick={partnerNotificationModalController.setFalse}>
            <PartnerNotificationModal
              handleClose={partnerNotificationModalController.setFalse}
              isOpen={partnerNotificationModalController.value}
              desktopClassName={classNames(
                css.notificationModal,
                partnerNotificationModalController.value && css.isOpen,
              )}
            />
          </OutsideClickHandler>
        </div>
        <div className={css.line}></div>

        <RenderWhen condition={!isMobileLayout}>
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
        </RenderWhen>
      </div>
    </div>
  );
};

export default PartnerHeader;
