import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import Modal from '@components/Modal/Modal';
import { useAppSelector } from '@hooks/reduxHooks';

import NotificationItem from '../NotificationItem/NotificationItem';

import css from './NotificationModal.module.scss';

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const NotificationList = () => {
  const notifications = useAppSelector(
    (state) => state.Notification.notifications,
    shallowEqual,
  );

  return (
    <div className={css.notifications}>
      {notifications.map((notificationItem: any) => (
        <NotificationItem
          key={notificationItem.id}
          notificationItem={notificationItem}
        />
      ))}
    </div>
  );
};
const NotificationModal: React.FC<NotificationModalProps> = (props) => {
  const { isOpen, onClose } = props;

  const notifications = useAppSelector(
    (state) => state.Notification.notifications,
    shallowEqual,
  );
  const intl = useIntl();

  return (
    <Modal
      id="NotificationModal"
      isOpen={isOpen}
      handleClose={onClose}
      className={css.modalContainer}
      title={intl.formatMessage({ id: 'thong-bao-0' })}>
      <div className={css.notifications}>
        {notifications.map((notificationItem: any) => (
          <NotificationItem
            key={notificationItem.id}
            notificationItem={notificationItem}
          />
        ))}
      </div>
    </Modal>
  );
};

export default NotificationModal;
