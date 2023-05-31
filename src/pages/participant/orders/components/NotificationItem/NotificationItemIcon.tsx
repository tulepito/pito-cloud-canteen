import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconClock from '@components/Icons/IconClock/IconClock';
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

  switch (type) {
    case ENotificationType.INVITATION:
      return <IconUser variant="withPlus" />;
    case ENotificationType.COMPANY_JOINED:
      return <IconUser variant="multiUser" />;
    case ENotificationType.ORDER_SUCCESS:
      return <IconTickWithBackground />;
    case ENotificationType.ORDER_CANCEL:
      return <IconCancel />;
    case ENotificationType.ORDER_DELIVERING:
      return <IconTruck variant="withBackground" />;
    case ENotificationType.ORDER_PICKING:
      return <IconClock variant="withBackground" />;
    case ENotificationType.ORDER_RATING:
      return <IconRatingStar />;

    default:
      return <IconUser />;
  }
};

export default NotificationItemIcon;
