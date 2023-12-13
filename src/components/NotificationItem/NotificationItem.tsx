import classNames from 'classnames';
import { useRouter } from 'next/router';

import { useAppDispatch } from '@hooks/reduxHooks';
import {
  BookerCompaniesActions,
  BookerCompaniesThunks,
} from '@redux/slices/BookerCompanies.slice';
import {
  NotificationActions,
  NotificationThunks,
} from '@redux/slices/notification.slice';
import { ENotificationType } from '@src/utils/enums';

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

  const wrapperClasses = classNames(css.itemWrapper, {
    [css.isNew]: seen !== true,
  });

  const handleClick = () => {
    if (notificationType !== ENotificationType.SUB_ORDER_UPDATED) {
      dispatch(NotificationThunks.markNotificationsSeen([id]));
      dispatch(NotificationActions.markNotificationsSeen([id]));

      dispatch(BookerCompaniesThunks.markNotificationSeen([id]));
      dispatch(BookerCompaniesActions.markNotificationsSeen([id]));
    }

    if (relatedLink) {
      router.push(relatedLink);
    }
  };

  return (
    <div className={wrapperClasses} onClick={handleClick}>
      <div className={css.notificationContent}>
        <NotificationItemIcon type={notificationType} />
        <NotificationItemInfo type={notificationType} notificationItem={rest} />
      </div>
    </div>
  );
};

export default NotificationItem;
