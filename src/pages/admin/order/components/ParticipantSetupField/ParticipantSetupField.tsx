import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import difference from 'lodash/difference';
import Link from 'next/link';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { useAppSelector } from '@hooks/reduxHooks';

import css from './ParticipantSetupField.module.scss';

type ParticipantSetupFieldProps = {
  form: any;
  clientId: string;
  title?: string;
  disabled?: boolean;
};
const ParticipantSetupField: React.FC<ParticipantSetupFieldProps> = (props) => {
  const { clientId, title, form, disabled = false } = props;
  const companies = useAppSelector(
    (state) => state.company.companyRefs,
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
  const handleSelectedGroupsChange = (value: any, previosValue: any) => {
    if (disabled) return;
    const [newOption] = difference(value, previosValue);
    if (newOption && newOption !== 'allMembers') {
      form.batch(() => {
        form.change(
          'selectedGroups',
          value.filter((v: string) => v !== 'allMembers'),
        );
      });
    } else if (newOption && newOption === 'allMembers') {
      form.batch(() => {
        form.change(
          'selectedGroups',
          value.filter((v: string) => v === 'allMembers'),
        );
      });
    }
  };

  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <OnChange name="selectedGroups">{handleSelectedGroupsChange}</OnChange>
      <div className={css.fieldGroups}>
        <FieldCheckbox
          id={`selectedGroups-allMember`}
          name="selectedGroups"
          value="allMembers"
          disabled={disabled}
          label={intl.formatMessage({ id: 'ParticipantSetupField.allMembers' })}
        />
        {groupOptionsRenderer}
      </div>
      <Link
        className={css.groupSetup}
        href={`/admin/company/${clientId}/edit/?tab=settings`}>
        Cài đặt nhóm
      </Link>
    </div>
  );
};
export default ParticipantSetupField;
