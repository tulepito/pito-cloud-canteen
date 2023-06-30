import React from 'react';

import { useAppSelector } from '@hooks/reduxHooks';

import NotificationItem from './NotificationItem';

import css from './NotificationContainer.module.scss';

export const NotificationContainer = () => {
  const notifications = useAppSelector(
    (state) => state.notificationPopup.notifications,
  );

  return (
    <div className={css.root}>
      {notifications.map((notification, index) => (
        <NotificationItem
          notification={notification}
          key={notification.id + notification.message}
          index={index}
        />
      ))}
    </div>
  );
};
