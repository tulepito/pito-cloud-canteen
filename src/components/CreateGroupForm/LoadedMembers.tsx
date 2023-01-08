import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import { Close } from '@components/Icons/Icons';
import useBoolean from '@hooks/useBoolean';

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
  const { value: isEditing, setTrue: onEditing } = useBoolean();
  const renderedEditState = isEditing ? (
    <FieldTextInput id={`${email}-editEmail`} name="memberEmail" />
  ) : (
    <div className={css.fullRowEmail}>{email}</div>
  );
  return (
    <div className={css.memberItem}>
      <div className={css.memberWrapper}>
        <div className={css.grayCircle} />
        {id ? (
          <div>
            <div className={css.name}>
              {getMemberDisplayName(companyMembers, id)}
            </div>
            <div className={css.email}>{email}</div>
          </div>
        ) : (
          renderedEditState
        )}
      </div>
      <div className={css.actionsWrapper}>
        {!id && <IconEdit onClick={() => onEditing()} />}
        <Close onClick={onDelete} />
      </div>
    </div>
  );
};
const LoadedMembers: React.FC<LoadedMembersProps> = (props) => {
  const { formattedLoadedMembers, companyMembers } = props;
  const onDeleteMember = (memberIndex: number) => () => {
    console.log('memberIndex: ', memberIndex);
  };
  return (
    <div className={css.container}>
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
