import isEmpty from 'lodash/isEmpty';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';

import AddParticipantForm from './AddParticipantForm';
import ImportParticipantFromFile from './ImportParticipantFromFile';
import ParticipantList from './ParticipantList';

import css from './ParticipantManagement.module.scss';

type TParticipantManagementProps = {};

const ParticipantManagement: React.FC<TParticipantManagementProps> = () => {
  const participantData = useAppSelector(
    (state) => state.BookerDraftOrderPage.participantData,
  );

  const isParticipantListEmpty = isEmpty(participantData);

  return (
    <div className={css.root}>
      <div>
        <div className={css.title}>Danh sách thành viên hiện tại</div>
        <RenderWhen condition={!isParticipantListEmpty}>
          <div className={css.count}>{participantData.length}</div>
        </RenderWhen>
      </div>

      <AddParticipantForm onSubmit={() => {}} />
      <ImportParticipantFromFile />
      <ParticipantList />
    </div>
  );
};

export default ParticipantManagement;
