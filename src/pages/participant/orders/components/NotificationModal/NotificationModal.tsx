import { shallowEqual } from 'react-redux';

import Modal from '@components/Modal/Modal';
import { useAppSelector } from '@hooks/reduxHooks';

import NotificationItem from '../NotificationItem/NotificationItem';

import css from './NotificationModal.module.scss';

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const NotificationModal: React.FC<NotificationModalProps> = (props) => {
  const { isOpen, onClose } = props;

  const notifications = useAppSelector(
    (state) => state.ParticipantOrderList.participantFirebaseNotifications,
    shallowEqual,
  );

  return (
    <Modal
      id="NotificationModal"
      isOpen={isOpen}
      handleClose={onClose}
      title="Thông báo">
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
