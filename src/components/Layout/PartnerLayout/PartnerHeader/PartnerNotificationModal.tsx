import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import NotificationItem from '@components/NotificationItem/NotificationItem';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  NotificationActions,
  NotificationThunks,
} from '@redux/slices/notification.slice';
import type { TObject } from '@src/utils/types';

import css from './PartnerNotificationModal.module.scss';

type TPartnerNotificationModalProps = {
  handleCloseTooltip: () => void;
};

const PartnerNotificationModal: React.FC<TPartnerNotificationModalProps> = ({
  handleCloseTooltip,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    (state) => state.Notification.notifications,
  );

  const notSeenNotificationIds = notifications.reduce(
    (ids, noti) => (noti?.seen !== true ? ids.concat(noti?.id) : ids),
    [],
  );

  const disableMarkAllViewed = notSeenNotificationIds.length === 0;

  const handleMarkAllViewed = () => {
    dispatch(NotificationThunks.markNotificationsSeen(notSeenNotificationIds));
    dispatch(NotificationActions.markNotificationsSeen(notSeenNotificationIds));
  };

  return (
    <div className={css.root}>
      <div className={css.head}>
        <span>
          {intl.formatMessage({ id: 'PartnerNotificationModal.title' })}
        </span>
        <div className={css.closeIconWrapper} onClick={handleCloseTooltip}>
          <IconClose className={css.closeIcon} />
        </div>
      </div>
      <div className={css.container}>
        {notifications.map((notificationItem: TObject) => (
          <NotificationItem
            key={notificationItem.id}
            notificationItem={notificationItem}
          />
        ))}
      </div>
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
