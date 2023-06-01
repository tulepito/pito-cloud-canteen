import IconBell from '@components/Icons/IconBell/IconBell';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './OrderListHeaderSection.module.scss';

type OrderListHeaderSectionProps = {
  numberOfUnseenNotifications: number;
  openNotificationModal: () => void;
};
const OrderListHeaderSection: React.FC<OrderListHeaderSectionProps> = (
  props,
) => {
  const { openNotificationModal, numberOfUnseenNotifications } = props;

  return (
    <div className={css.sectionWrapper}>
      <div className={css.sectionTitle}>Lịch của tôi</div>
      <div className={css.iconWrapper} onClick={openNotificationModal}>
        <IconBell />
        <RenderWhen condition={numberOfUnseenNotifications > 0}>
          <div className={css.notiNumber}>{numberOfUnseenNotifications}</div>
        </RenderWhen>
      </div>
    </div>
  );
};

export default OrderListHeaderSection;
