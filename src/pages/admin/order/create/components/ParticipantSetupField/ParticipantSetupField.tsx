import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import { useAppSelector } from '@hooks/reduxHooks';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './ParticipantSetupField.module.scss';

type ParticipantSetupFieldProps = {
  clientId: string;
  title?: string;
};
const ParticipantSetupField: React.FC<ParticipantSetupFieldProps> = (props) => {
  const { clientId, title } = props;
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
      id={`selectedGroups-${group.id}`}
      name="selectedGroups"
      value={group.id}
      label={group.name}
    />
  ));
  const intl = useIntl();
  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}

      <div className={css.fieldGroups}>
        <FieldCheckbox
          id={`selectedGroups-allMember`}
          name="selectedGroups"
          value="allMembers"
          label={intl.formatMessage({ id: 'ParticipantSetupField.allMembers' })}
        />
        {groupOptionsRenderer}
      </div>
      <Link
        className={css.groupSetup}
        href={`/admin/company/${clientId}/group-setting`}>
        Cài đặt nhóm
      </Link>
    </div>
  );
};
export default ParticipantSetupField;
