import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconClock from '@components/Icons/IconClock/IconClock';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconRatingStar from '@components/Icons/IconRatingStar/IconRatingStar';
import IconSharing from '@components/Icons/IconSharing/IconSharing';
import IconStar from '@components/Icons/IconStar/IconStar';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import IconUser from '@components/Icons/IconUser/IconUser';
import { ENotificationType } from '@src/utils/enums';

import css from './NotificationItemIcon.module.scss';

type NotificationItemIconProps = {
  type: string;
};

const NotificationItemIcon: React.FC<NotificationItemIconProps> = (props) => {
  const { type } = props;
  let icon = null;
  switch (type) {
    case ENotificationType.INVITATION:
      icon = <IconUser variant="withPlus" />;
      break;
    case ENotificationType.COMPANY_JOINED:
      icon = <IconUser variant="multiUser" />;
      break;
    case ENotificationType.SUB_ORDER_DELIVERED:
    case ENotificationType.ORDER_SUCCESS:
    case ENotificationType.BOOKER_SUB_ORDER_COMPLETED:
      icon = <IconTickWithBackground />;
      break;
    case ENotificationType.SUB_ORDER_CANCELED:
    case ENotificationType.ORDER_CANCEL:
    case ENotificationType.BOOKER_SUB_ORDER_CANCELLED:
      icon = <IconCancel />;
      break;
    case ENotificationType.SUB_ORDER_DELIVERING:
    case ENotificationType.ORDER_DELIVERING:
      icon = <IconTruck variant="withBackground" />;
      break;
    case ENotificationType.ORDER_PICKING:
    case ENotificationType.SUB_ORDER_INPROGRESS:
    case ENotificationType.BOOKER_NEW_ORDER_CREATED:
      icon = <IconClock variant="withBackground" />;
      break;
    case ENotificationType.ORDER_RATING:
    case ENotificationType.BOOKER_RATE_ORDER:
      icon = <IconRatingStar />;
      break;
    case ENotificationType.PARTNER_FOOD_CREATED_BY_ADMIN:
    case ENotificationType.PARTNER_FOOD_ACCEPTED_BY_ADMIN:
    case ENotificationType.PARTNER_FOOD_REJECTED_BY_ADMIN:
      icon = <IconFood />;
      break;
    case ENotificationType.PARTNER_PROFILE_UPDATED_BY_ADMIN:
    case ENotificationType.SUB_ORDER_UPDATED:
    case ENotificationType.BOOKER_ORDER_CHANGED:
      icon = <IconEdit className={css.editIcon} />;
      break;

    case ENotificationType.BOOKER_PICKING_ORDER:
      icon = <IconSharing className={css.iconSharing} />;
      break;
    case ENotificationType.SUB_ORDER_REVIEWED_BY_PARTICIPANT:
    case ENotificationType.SUB_ORDER_REVIEWED_BY_BOOKER:
      icon = <IconStar />;
      break;

    default:
      icon = null;
      break;
  }

  return <div className={css.iconContainer}>{icon}</div>;
};
export default NotificationItemIcon;
