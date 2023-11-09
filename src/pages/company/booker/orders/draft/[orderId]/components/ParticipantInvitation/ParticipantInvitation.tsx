import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';

import css from './ParticipantInvitation.module.scss';

type TParticipantInvitationProps = {
  onGoBack: () => void;
  onPublishOrder: () => void;
};

const ParticipantInvitation: React.FC<TParticipantInvitationProps> = ({
  onGoBack,
}) => {
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
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantInvitation;
