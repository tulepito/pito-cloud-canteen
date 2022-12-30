import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import { useAppSelector } from '@hooks/reduxHooks';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ParticipantSetupField.module.scss';

type ParticipantSetupFieldProps = {
  clientId: string;
};
const ParticipantSetupField: React.FC<ParticipantSetupFieldProps> = (props) => {
  const { clientId } = props;
  const companies = useAppSelector(
    (state) => state.ManageCompaniesPage.companyRefs,
    shallowEqual,
  );
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );

  const { groups = [] } =
    (currentClient && currentClient.attributes.profile.metadata) || {};
  const groupOptionsRenderer = groups.map((group: any) => (
    <FieldCheckbox
      key={group.id}
      id={`participantSetup-${group.id}`}
      name="participantSetup"
      value={group.id}
      label={group.name}
    />
  ));
  const intl = useIntl();
  return (
    <div className={css.container}>
      <div className={css.fieldTitle}>
        {intl.formatMessage({ id: 'ParticipantSetupField.title' })}
      </div>
      <div className={css.fieldGroups}>
        <FieldCheckbox
          id={`participantSetup-allMember`}
          name="participantSetup"
          value="allMembers"
          label={intl.formatMessage({ id: 'ParticipantSetupField.allMembers' })}
        />
        {groupOptionsRenderer}
      </div>
    </div>
  );
};
export default ParticipantSetupField;
