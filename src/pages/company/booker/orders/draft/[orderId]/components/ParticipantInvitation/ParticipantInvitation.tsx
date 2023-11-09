import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import AlertModal from '@components/Modal/AlertModal';
import useBoolean from '@hooks/useBoolean';

import DeliveryDateTimeForm from './DeliveryDateTimeForm';

import css from './ParticipantInvitation.module.scss';

type TParticipantInvitationProps = {
  onGoBack: () => void;
  onPublishOrder: () => void;
};

const ParticipantInvitation: React.FC<TParticipantInvitationProps> = ({
  onGoBack,
}) => {
  const confirmPublishOrderControl = useBoolean();
  const handleSubmitPublishOrder = () => {};

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
        <div>
          <div>
            <DeliveryDateTimeForm
              onSubmit={confirmPublishOrderControl.setTrue}
            />
            <AlertModal
              childrenClassName={css.confirmModalChildrenContainer}
              isOpen={confirmPublishOrderControl.value}
              handleClose={onGoBack}
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
