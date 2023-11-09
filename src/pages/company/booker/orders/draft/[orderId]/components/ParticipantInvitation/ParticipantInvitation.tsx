import css from './ParticipantInvitation.module.scss';

type TParticipantInvitationProps = {
  onGoBack: () => void;
  onPublishOrder: () => void;
};

const ParticipantInvitation: React.FC<TParticipantInvitationProps> = () => {
  return <div className={css.root}>ParticipantInvitation</div>;
};

export default ParticipantInvitation;
