import { useEffect } from 'react';

import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import NotificationItem from '@components/NotificationItem/NotificationItem';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { BookerCompaniesThunks } from '@redux/slices/BookerCompanies.slice';
import type { TFBNotification } from '@src/utils/types';

import css from './BookerNotificationModal.module.scss';

type TBookerNotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NotifcationItem = Required<Pick<TFBNotification, 'id'>> &
  Partial<TFBNotification>;

const BookerNotificationModal: React.FC<TBookerNotificationModalProps> = (
  props,
) => {
  const { isOpen, onClose } = props;
  const dispatch = useAppDispatch();

  const bookerNotifications = useAppSelector(
    (state) => state.BookerCompanies.notifications,
  );

  useEffect(() => {
    dispatch(BookerCompaniesThunks.fetchBookerNotifications());
  }, [dispatch]);

  return (
    <Modal
      id="BookerNotificationModal"
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      customHeader={
        <div className={css.header}>
          <div className={css.title}>Thông báo</div>
          <IconClose onClick={onClose} />
        </div>
      }>
      <div className={css.content}>
        {bookerNotifications.map((notificationItem: NotifcationItem) => (
          <NotificationItem
            key={notificationItem.id}
            notificationItem={notificationItem}
          />
        ))}
      </div>
    </Modal>
  );
};

export default BookerNotificationModal;
