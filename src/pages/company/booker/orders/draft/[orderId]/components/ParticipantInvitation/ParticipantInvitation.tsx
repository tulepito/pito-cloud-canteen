import { DateTime } from 'luxon';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import AlertModal from '@components/Modal/AlertModal';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { Listing } from '@src/utils/data';

import DeadlineDateTimeForm from './DeadlineDateTimeForm';

import css from './ParticipantInvitation.module.scss';

type TParticipantInvitationProps = {
  onGoBack: () => void;
  onPublishOrder: () => void;
};

const ParticipantInvitation: React.FC<TParticipantInvitationProps> = ({
  onGoBack,
  onPublishOrder,
}) => {
  const confirmPublishOrderControl = useBoolean();
  const order = useAppSelector((state) => state.Order.order);

  const { startDate, deadlineDate, deadlineHour } =
    Listing(order).getMetadata();

  // * calculate start delivery time
  const nextStartWeek = DateTime.fromJSDate(new Date())
    .startOf('week')
    .startOf('day')
    .plus({ days: 7 })
    .toMillis();
  const deliveryTime = new Date(startDate || nextStartWeek);

  // * prepare deadline date time form initial
  const defaultDeadlineDate = DateTime.fromMillis(startDate || nextStartWeek)
    .minus({ days: 2 })
    .toMillis();
  const deadlineDateTimeInitialValues = {
    deadlineDate: new Date(deadlineDate).getTime() || defaultDeadlineDate,
    deadlineHour: deadlineHour || '06:30',
  };

  const handleSubmitPublishOrder = () => {
    confirmPublishOrderControl.setFalse();
    onPublishOrder();
  };

  return (
    <div className={css.root}>
      <div className={css.contentContainer}>
        <div className={css.titleContainer}>
          <Button
            variant="inline"
            className={css.goBackContainer}
            onClick={onGoBack}>
            <IconArrow direction="left" />
            <span className={css.goBackText}>Quay lại</span>
          </Button>
          <div className={css.title}>
            <div>Mời thành viên tham gia nhóm</div>
            <Badge label="Các thành viên được mời sẽ nhận thông báo chọn món ngay sau khi gửi lời mời" />
          </div>
        </div>
        <div className={css.participantInvitationContainer}>
          <div>
            <DeadlineDateTimeForm
              deliveryTime={deliveryTime}
              initialValues={deadlineDateTimeInitialValues}
              onSubmit={confirmPublishOrderControl.setTrue}
            />
            <AlertModal
              childrenClassName={css.confirmModalChildrenContainer}
              isOpen={confirmPublishOrderControl.value}
              handleClose={confirmPublishOrderControl.setFalse}
              title="Xác nhận đơn và gửi lời mời"
              cancelLabel="Đóng"
              confirmLabel={'Gửi lời mời'}
              confirmDisabled={true}
              onCancel={onGoBack}
              onConfirm={handleSubmitPublishOrder}>
              Sau khi gửi, bạn sẽ không thể chỉnh sửa thực đơn của tuần ăn.
            </AlertModal>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantInvitation;
