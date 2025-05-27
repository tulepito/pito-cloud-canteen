import { useIntl } from 'react-intl';

import IconBell from '@components/Icons/IconBell/IconBell';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';

import { NotificationList } from '../NotificationModal/NotificationModal';

import css from './OrderListHeaderSection.module.scss';

type OrderListHeaderSectionProps = {
  numberOfUnseenNotifications: number;
  openNotificationModal: () => void;
};
const OrderListHeaderSection: React.FC<OrderListHeaderSectionProps> = (
  props,
) => {
  const intl = useIntl();
  const { openNotificationModal, numberOfUnseenNotifications } = props;
  const desktopNotificationTooltipController = useBoolean();
  const { isMobileLayout } = useViewport();

  const bellElement = (
    <div className={css.iconWrapper}>
      <IconBell />
      <RenderWhen condition={numberOfUnseenNotifications > 0}>
        <div className={css.notiNumber}>{numberOfUnseenNotifications}</div>
      </RenderWhen>
    </div>
  );

  return (
    <div className={css.sectionWrapper}>
      <div className={css.sectionTitle}>
        {intl.formatMessage({ id: 'GeneralLayoutTopBar.menuItem.myCalender' })}
      </div>
      <RenderWhen condition={!isMobileLayout}>
        <div className={css.notificationWrapper}>
          <OutsideClickHandler
            onOutsideClick={desktopNotificationTooltipController.setFalse}>
            <div onClick={desktopNotificationTooltipController.toggle}>
              {bellElement}
            </div>
            <RenderWhen condition={desktopNotificationTooltipController.value}>
              <div className={css.notificationTooltip}>
                <NotificationList />
              </div>
            </RenderWhen>
          </OutsideClickHandler>
        </div>

        <RenderWhen.False>
          <div onClick={openNotificationModal}>{bellElement}</div>
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default OrderListHeaderSection;
