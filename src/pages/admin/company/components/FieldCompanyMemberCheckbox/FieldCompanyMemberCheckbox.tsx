/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TCompanyMemberWithDetails } from '@utils/types';

import css from './FieldCompanyMemberCheckbox.module.scss';

type TFieldCompanyMemberCheckbox = {
  member: TCompanyMemberWithDetails;
  onRemoveItem?: (id: string) => void;
  onremoveNotFoundUserByEmail?: (email: string) => void;
  className?: string;
  name?: string;
};

const FieldCompanyMemberCheckbox: React.FC<TFieldCompanyMemberCheckbox> = (
  props,
) => {
  const { member, className, name } = props;
  const { email, profile } = member?.attributes || {};
  const { lastName = '', firstName = '', displayName } = profile || {};

  const profileSection = (
    <div className={css.profileWrapper}>
      <>
        <div className={css.avatar}>
          <Avatar user={member} />
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
    </div>
  );

  return (
    <div className={classNames(css.root, className)}>
      <FieldCheckbox
        name={name || 'members'}
        id={`members.${member.email}`}
        value={member.email}
        label=" "
      />
      {profileSection}
    </div>
  );
};

export default FieldCompanyMemberCheckbox;
