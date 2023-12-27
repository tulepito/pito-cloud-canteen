import { useRouter } from 'next/router';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  NotificationActions,
  NotificationThunks,
} from '@redux/slices/notification.slice';

import NotificationItemIcon from './NotificationItemIcon';
import NotificationItemInfo from './NotificationItemInfo';

import css from './NotificationItem.module.scss';

type NotificationItemProps = {
  notificationItem: any;
};

const NotificationItem: React.FC<NotificationItemProps> = (props) => {
  const { notificationItem } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notificationType, id, seen, relatedLink, ...rest } = notificationItem;
  const handleNotificationItemClick = () => {
    dispatch(NotificationThunks.markNotificationsSeen([id]));
    dispatch(NotificationActions.markNotificationsSeen([id]));
    if (relatedLink) {
      router.push(relatedLink);
    }
  };

  return (
    <div className={css.itemWrapper} onClick={handleNotificationItemClick}>
      <div className={css.notificationContent}>
        <div className={css.iconWrapper}>
          <NotificationItemIcon type={notificationType} />
        </div>
        <NotificationItemInfo type={notificationType} notificationItem={rest} />
      </div>

      <RenderWhen condition={!seen}>
        <div className={css.redDot}></div>
      </RenderWhen>
    </div>
  );
};

export default NotificationItem;
