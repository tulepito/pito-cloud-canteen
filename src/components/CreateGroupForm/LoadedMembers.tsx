import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import IconEdit from '@components/IconEdit/IconEdit';
import { Close } from '@components/Icons/Icons';
import { useState } from 'react';

import css from './LoadedMembers.module.scss';

type LoadedMembersProps = {
  formattedLoadedMembers: any[];
  companyMembers: any[];
};

const getMemberDisplayName = (companyMembers: any[], memberId: string) => {
  return companyMembers.find((_member) => _member.id.uuid === memberId)
    .attributes.profile.displayName;
};

const LoadedItem = ({ item, companyMembers, onDelete }: any) => {
  const { email, id } = item;
  const [isEditing, setEditing] = useState<boolean>(false);
  const renderedEditState = isEditing ? (
    <FieldTextInput id={`${email}-editEmail`} name="memberEmail" />
  ) : (
    <div>{email}</div>
  );
  return (
    <div>
      <div className={css.grayCircle} />
      {id ? (
        <div>
          <div>{getMemberDisplayName(companyMembers, id)}</div>
          <div>{email}</div>
        </div>
      ) : (
        renderedEditState
      )}
      <div>
        {!id && <IconEdit onClick={() => setEditing(true)} />}
        <Close onClick={onDelete} />
      </div>
    </div>
  );
};
const LoadedMembers: React.FC<LoadedMembersProps> = (props) => {
  const { formattedLoadedMembers, companyMembers } = props;
  const onDeleteMember = (memberIndex: number) => () => {
    // update member
    console.log('memberIndex: ', memberIndex);
  };
  return (
    <div>
      {formattedLoadedMembers.map((item, index) => (
        <LoadedItem
          key={index}
          onDelete={onDeleteMember(index)}
          item={item}
          companyMembers={companyMembers}
        />
      ))}
    </div>
  );
};

export default LoadedMembers;
