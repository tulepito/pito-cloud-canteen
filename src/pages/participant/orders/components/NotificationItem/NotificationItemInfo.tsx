import { useIntl } from 'react-intl';

import { calcPastTime, formatTimestamp } from '@src/utils/dates';
import { ENotificationType } from '@src/utils/enums';

import css from './NotificationItem.module.scss';

type NotificationItemInfoProps = {
  type: string;
  notificationItem: {
    time: number;
    [key: string]: any;
  };
};
const NotificationItemInfo: React.FC<NotificationItemInfoProps> = (props) => {
  const { type, notificationItem } = props;
  const intl = useIntl();
  const {
    createdAt,
    bookerName,
    companyName,
    orderTitle,
    subOrderDate = 0,
    foodName,
    partnerName,
  } = notificationItem;
  const { seconds } = createdAt;
  const formattedDate = formatTimestamp(subOrderDate, 'dd/MM/yyyy');

  const pastTime = calcPastTime(seconds * 1000);

  switch (type) {
    case ENotificationType.INVITATION:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.invitation',
              },
              {
                span: (msg) => <span className={css.boldText}>{msg}</span>,
                bookerName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.COMPANY_JOINED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.companyJoined',
              },
              {
                span: (msg) => <span className={css.boldText}>{msg}</span>,
                companyName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_PICKING:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderPicking',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                orderTitle: `#${orderTitle}`,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_DELIVERING:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderDelivering',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_CANCEL:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderCancel',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_SUCCESS:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderSuccess',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_RATING:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderRating',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                foodName,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ADMIN_REPLY_REVIEW:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.adminReplyReview',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                foodName,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.PARTNER_REPLY_REVIEW:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.partnerReplyReview',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                foodName,
                subOrderDate: formattedDate,
                partnerName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    default:
      return <div></div>;
  }
};

export default NotificationItemInfo;
