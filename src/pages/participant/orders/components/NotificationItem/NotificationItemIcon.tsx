import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconClock from '@components/Icons/IconClock/IconClock';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconRatingStar from '@components/Icons/IconRatingStar/IconRatingStar';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import IconTruck from '@components/Icons/IconTruck/IconTruck';
import IconUser from '@components/Icons/IconUser/IconUser';
import { ENotificationType } from '@src/utils/enums';

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
      icon = <IconTickWithBackground />;
      break;
    case ENotificationType.SUB_ORDER_CANCELED:
    case ENotificationType.ORDER_CANCEL:
      icon = <IconCancel />;
      break;
    case ENotificationType.SUB_ORDER_DELIVERING:
    case ENotificationType.ORDER_DELIVERING:
      icon = <IconTruck variant="withBackground" />;
      break;
    case ENotificationType.ORDER_PICKING:
    case ENotificationType.SUB_ORDER_INPROGRESS:
      icon = <IconClock variant="withBackground" />;
      break;
    case ENotificationType.ORDER_RATING:
    case ENotificationType.ADMIN_REPLY_REVIEW:
    case ENotificationType.PARTNER_REPLY_REVIEW:
      icon = <IconRatingStar />;
      break;
    case ENotificationType.PARTNER_FOOD_CREATED_BY_ADMIN:
      icon = <IconFood />;
      break;
    case ENotificationType.PARTNER_PROFILE_UPDATED_BY_ADMIN:
    case ENotificationType.SUB_ORDER_UPDATED:
      icon = <IconEdit />;
      break;

    default:
      icon = <IconUser />;
      break;
  }

  return icon;
};
export default NotificationItemIcon;
