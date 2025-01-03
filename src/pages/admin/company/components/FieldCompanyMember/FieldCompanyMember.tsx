/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import { InlineTextButton } from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TCompanyMemberWithDetails } from '@utils/types';

import css from './FieldCompanyMember.module.scss';

type TFieldCompanyMemberCheckbox = {
  user: TCompanyMemberWithDetails;
  onRemoveItem?: (id: string) => void;
  onremoveNotFoundUserByEmail?: (email: string) => void;
  className?: string;
};

const FieldCompanyMemberCheckbox: React.FC<TFieldCompanyMemberCheckbox> = (
  props,
) => {
  const { user, onRemoveItem, onremoveNotFoundUserByEmail, className } = props;
  const { email, profile } = user?.attributes || {};
  const { lastName = '', firstName = '', displayName } = profile || {};

  const handleRemoveItem = () =>
    !user?.id?.uuid
      ? onremoveNotFoundUserByEmail &&
        onremoveNotFoundUserByEmail(user as unknown as string)
      : onRemoveItem && onRemoveItem(user.id.uuid);
  const profileSection = (
    <div className={css.profileWrapper}>
      {user?.id?.uuid ? (
        <>
          <div className={css.avatar}>
            <Avatar user={user} />
          </div>
          <div className={css.userDetails}>
            <h3 className={css.userDisplayName}>
              {buildFullName(firstName, lastName, {
                compareToGetLongerWith: displayName,
              })}
            </h3>
            <p className={css.userEmail}>{email}</p>
          </div>
        </>
      ) : (
        <>
          <div className={css.avatar}>
            <Avatar user={user} />
          </div>
          <p className={css.notFoundEmail}>{user as unknown as string}</p>
        </>
      )}
    </div>
  );

  return (
    <div className={classNames(css.root, className)}>
      {profileSection}
      <InlineTextButton onClick={handleRemoveItem} type="button">
        <IconClose className={css.iconClose} />
      </InlineTextButton>
    </div>
  );
};

export default FieldCompanyMemberCheckbox;
