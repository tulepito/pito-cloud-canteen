import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import IconTickWithCircle from '@components/Icons/IconTickWithCircle/IconTickWithCircle';
import Modal from '@components/Modal/Modal';
import { participantPaths } from '@src/paths';
import { VNTimezone } from '@src/utils/dates';

import css from './SectionOrderPanel.module.scss';

type TSuccessModal = {
  isOpen: boolean;
  orderDeadline: number;
  handleClose: () => void;
};

const SuccessModal: React.FC<TSuccessModal> = ({
  isOpen,
  handleClose,
  orderDeadline,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const { handleSelectDay } = useSelectDay();

  const deadlineDateObj = DateTime.fromMillis(orderDeadline);
  const { orderDay } = router.query;

  const orderEndAtMessage = intl.formatMessage(
    {
      id: 'SectionCountdown.orderEndAtMessage',
    },
    {
      label: (
        <span className={css.orderEndAtLabel}>
          {intl.formatMessage({
            id: 'SectionOrderPanel.successModal.description',
          })}
        </span>
      ),
      hour: deadlineDateObj.toFormat('T'),
      day: deadlineDateObj.get('day'),
      month: deadlineDateObj.get('month'),
      year: deadlineDateObj.get('year'),
    },
  );

  const goToHomePage = () => {
    const orderDate = DateTime.fromMillis(Number(orderDay)).setZone(VNTimezone);
    handleSelectDay(orderDate.toJSDate());
    router.push(participantPaths.OrderList);
  };

  return (
    <Modal
      id="ParticipantOrderSuccessModal"
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={css.successModalContainer}
      customHeader={
        <div className={css.successModalImage}>
          <IconTickWithCircle />
        </div>
      }
      shouldFullScreenInMobile={false}>
      <div>
        <div className={css.successModalTitle}>
          {intl.formatMessage({
            id: 'SectionOrderPanel.successModal.title',
          })}
        </div>
        <p className={css.successModalDescription}>{orderEndAtMessage}</p>
        <div className={css.actionWrapper}>
          <Button
            className={css.closeModal}
            variant="inline"
            onClick={handleClose}>
            {intl.formatMessage({
              id: 'Modal.closeModal',
            })}
          </Button>
          <Button className={css.goToHomePage} onClick={goToHomePage}>
            {intl.formatMessage({
              id: 'SectionOrderPanel.successModal.goToHomePage',
            })}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
