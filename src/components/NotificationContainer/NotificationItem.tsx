import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import Link from 'next/link';

import IconCheckStatus from '@components/Icons/IconCheckStatus/IconCheckStatus';
import IconDanger from '@components/Icons/IconDanger/IconDanger';
import IconWarning from '@components/Icons/IconWarning/IconWarning';
import { useAppDispatch } from '@hooks/reduxHooks';
import { NotificationThunks } from '@redux/slices/notificationPopup.slice';
import { ENotificationPopupType } from '@src/utils/enums';
import type { TNotification } from '@src/utils/types';

import css from './NotificationItem.module.scss';

type TNotificationItem = {
  notification: TNotification;
  index: number;
};

const NotificationItem: React.FC<TNotificationItem> = (props) => {
  const { notification, index } = props;
  const { type, message, hidden, messageValues, linkProps } = notification;
  const intl = useIntl();
  const [show, setShow] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const t = setTimeout(() => {
      setShow(true);
      dispatch(NotificationThunks.delayedHideNotifications(notification));
      clearTimeout(t);
    }, 100 * (index + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messageRender =
    typeof message === 'string'
      ? intl.formatMessage(
          {
            id: message,
          },
          { ...messageValues },
        )
      : message;

  let messageWrapper;

  switch (type) {
    case ENotificationPopupType.success:
      messageWrapper = (
        <div
          className={classNames(css.messageWrapper, css.messageWrapperSucces)}>
          <IconCheckStatus className={css.checkStatus} />
          <div>{messageRender}</div>
        </div>
      );
      break;
    case ENotificationPopupType.warning:
      messageWrapper = (
        <div
          className={classNames(css.messageWrapper, css.messageWrapperWarning)}>
          <IconWarning />
          <div>{messageRender}</div>
        </div>
      );
      break;

    case ENotificationPopupType.error:
      messageWrapper = (
        <div
          className={classNames(css.messageWrapper, css.messageWrapperError)}>
          <IconDanger />
          <div>{messageRender}</div>
        </div>
      );
      break;

    default:
      break;
  }

  const wrapperClasses = classNames(css.notification, {
    [css.hidden]: hidden,
  });

  return show ? (
    linkProps ? (
      <div className={wrapperClasses}>
        <Link className={css.link} {...linkProps}>
          {messageWrapper}
        </Link>
      </div>
    ) : (
      <div className={wrapperClasses}>{messageWrapper}</div>
    )
  ) : (
    <></>
  );
};

export default NotificationItem;
