import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import NotificationItem from '@components/NotificationItem/NotificationItem';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import {
  NotificationActions,
  NotificationThunks,
} from '@redux/slices/notification.slice';
import type { TObject } from '@src/utils/types';

import css from './PartnerNotificationModal.module.scss';

type TPartnerNotificationModalProps = {
  handleClose: () => void;
  isOpen: boolean;
  desktopClassName?: string;
};

const PartnerNotificationModal: React.FC<TPartnerNotificationModalProps> = ({
  isOpen,
  handleClose,
  desktopClassName,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    (state) => state.Notification.notifications,
  );

  const { isMobileLayout, isTabletLayout } = useViewport();

  const notSeenNotificationIds = notifications.reduce(
    (ids, noti) => (noti?.seen !== true ? ids.concat(noti?.id) : ids),
    [],
  );

  const disableMarkAllViewed = notSeenNotificationIds.length === 0;

  const desktopClasses = classNames(css.root, desktopClassName);

  const handleMarkAllViewed = () => {
    dispatch(NotificationThunks.markNotificationsSeen(notSeenNotificationIds));
    dispatch(NotificationActions.markNotificationsSeen(notSeenNotificationIds));
  };

  const notificationContent = (
    <>
      <div className={css.container}>
        {notifications.map((notificationItem: TObject) => (
          <NotificationItem
            key={notificationItem.id}
            notificationItem={notificationItem}
          />
        ))}
      </div>
    </>
  );

  const mobileModal = (
    <Modal
      id="PartnerNotificationModal"
      isOpen={isOpen}
      shouldFullScreenInMobile
      containerClassName={css.modalContainer}
      customHeader={
        <div className={css.header}>
          <div className={css.title}>Thông báo</div>
          <IconClose onClick={handleClose} />
        </div>
      }
      handleClose={handleClose}>
      {notificationContent}
    </Modal>
  );

  if (isMobileLayout || isTabletLayout) {
    return mobileModal;
  }

  return (
    <div className={desktopClasses}>
      <div className={css.head}>
        <span>
          {intl.formatMessage({ id: 'PartnerNotificationModal.title' })}
        </span>
        <div className={css.closeIconWrapper} onClick={handleClose}>
          <IconClose className={css.closeIcon} />
        </div>
      </div>
      {notificationContent}
      <div className={css.bottom}>
        <Button
          variant="inline"
          disabled={disableMarkAllViewed}
          className={css.markAllViewedBtn}
          onClick={handleMarkAllViewed}>
          {intl.formatMessage({ id: 'PartnerNotificationModal.markAllViewed' })}
        </Button>
      </div>
    </div>
  );
};

export default PartnerNotificationModal;
