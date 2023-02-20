import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import type { TUser } from '@utils/types';
import React from 'react';

import css from './FieldCompanyMemberCheckbox.module.scss';

type TFieldCompanyMemberCheckbox = {
  user: TUser;
  onRemoveItem: (id: string) => void;
};

const FieldCompanyMemberCheckbox: React.FC<TFieldCompanyMemberCheckbox> = (
  props,
) => {
  const { user, onRemoveItem } = props;
  const { email, profile } = user.attributes;
  const { displayName } = profile;

  const handleRemoveItem = () => onRemoveItem(user.id.uuid);

  return (
    <div className={css.root}>
      <div className={css.profileWrapper}>
        <Avatar user={user} />
        <div className={css.userDetails}>
          <h3 className={css.userDisplayName}>{displayName}</h3>
          <p className={css.userEmail}>{email}</p>
        </div>
      </div>
      <InlineTextButton onClick={handleRemoveItem} type="button">
        <IconClose className={css.iconClose} />
      </InlineTextButton>
    </div>
  );
};

export default FieldCompanyMemberCheckbox;
