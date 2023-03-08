/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import type { IntlShape } from 'react-intl';
import { useIntl } from 'react-intl';

import { InlineTextButton } from '@components/Button/Button';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import AlertModal from '@components/Modal/AlertModal';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { UserPermission } from '@src/types/UserPermission';
import type { TCompanyGroup, TCompanyMemberWithDetails } from '@utils/types';

import css from './ManageCompanyMembersTable.module.scss';

type ManageCompaniesMemberTableEntity = {
  permission: string;
  name: string;
  email: string;
  groupName: string;
};

const TABLE_COLUMN: TColumn[] &
  Partial<{
    render: (
      data: ManageCompaniesMemberTableEntity,
      isChecked: boolean,
    ) => ReactNode;
  }> = [
  {
    key: 'name',
    label: 'Tên',
    render: (data) => {
      const { name } = data;
      if (!name) return <span className={css.boldText}>Chưa xác nhận</span>;
      return <span>{name}</span>;
    },
  },
  {
    key: 'email',
    label: 'Email',
    render: ({ email }) => {
      return <span>{email}</span>;
    },
  },
  {
    key: 'role',
    label: 'Vai trò',
    render: ({ permission, handleToUpdateMemberPermission, intl }) => {
      if (!handleToUpdateMemberPermission) {
        return (
          <span>
            {intl.formatMessage({ id: `UserPermission.${permission}` })}
          </span>
        );
      }

      return (
        <select
          onChange={handleToUpdateMemberPermission}
          defaultValue={permission}
          className={css.fieldSelect}>
          {Object.keys(UserPermission).map((key) => (
            <option
              key={UserPermission[key as keyof typeof UserPermission]}
              value={UserPermission[key as keyof typeof UserPermission]}>
              {intl.formatMessage({
                id: `UserPermission.${
                  UserPermission[key as keyof typeof UserPermission]
                }`,
              })}
            </option>
          ))}
        </select>
      );
    },
  },
  {
    key: 'groupName',
    label: 'Nhóm',
    render: ({ groups = [] }) => {
      const groupNames = groups.reduce((prev: string, cur: TCompanyGroup) => {
        if (!prev) {
          return cur.name;
        }
        return `${prev}, ${cur.name}`;
      }, '');
      return <span>{groupNames}</span>;
    },
  },
  {
    key: 'allergy',
    label: 'Dị ứng',
    render: () => {
      return <span></span>;
    },
  },
  {
    key: 'nutritions',
    label: 'Chế độ dịnh dưỡng',
    render: () => {
      return <span></span>;
    },
  },
  {
    key: 'action',
    label: '',
    render: ({ handleToRemoveMember }) => {
      return (
        <div className={css.actionButtons}>
          <InlineTextButton type="button" onClick={handleToRemoveMember}>
            <IconDelete />
          </InlineTextButton>
        </div>
      );
    },
  },
];

type TManageCompanyMembersTable = {
  className?: string;
  companyMembers: TCompanyMemberWithDetails[];
  companyGroups: TCompanyGroup[];
  onRemoveMember: (email: string) => void;
  deleteMemberInProgress?: boolean;
  deleteMemberError?: any;
  hideRemoveConfirmModal?: boolean;
  onUpdateMemberPermission?: (params: {
    memberEmail: string;
    permission: string;
  }) => void;
};

const parseEntitiesToTableData = (
  intl: IntlShape,
  companyGroups: TCompanyGroup[],
  openRemoveModal: (member: TCompanyMemberWithDetails) => void,
  onUpdateMemberPermission?: (params: {
    memberEmail: string;
    permission: string;
  }) => void,
  companyMembers: TCompanyMemberWithDetails[] = [],
) => {
  return companyMembers.map((companyMember) => {
    const groups = companyGroups.filter((group: TCompanyGroup) =>
      companyMember.groups.includes(group.id),
    );
    const hasAttributes = companyMember?.attributes;

    const handleToRemove = () => {
      openRemoveModal(companyMember);
    };

    const handleToUpdateMemberPermission = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const { value } = e.target;
      if (!onUpdateMemberPermission) return;

      return onUpdateMemberPermission({
        memberEmail: companyMember.email,
        permission: value,
      });
    };

    if (!hasAttributes) {
      return {
        key: companyMember.id,
        data: {
          id: companyMember.id,
          permission: companyMember.permission,
          email: companyMember.email,
          groups,
          handleToRemoveMember: handleToRemove,
          ...(typeof onUpdateMemberPermission !== 'undefined'
            ? { handleToUpdateMemberPermission }
            : {}),
          intl,
        },
      };
    }

    return {
      key: companyMember.id,
      data: {
        id: companyMember.id,
        permission: companyMember.permission,
        name: companyMember.attributes.profile.displayName,
        email: companyMember.attributes.email,
        groups,
        handleToRemoveMember: handleToRemove,
        ...(typeof onUpdateMemberPermission !== 'undefined'
          ? { handleToUpdateMemberPermission }
          : {}),
        intl,
      },
    };
  });
};

const ManageCompanyMembersTable: React.FC<TManageCompanyMembersTable> = (
  props,
) => {
  const {
    companyMembers,
    companyGroups,
    onRemoveMember,
    deleteMemberInProgress,
    hideRemoveConfirmModal,
    onUpdateMemberPermission,
  } = props;
  const intl = useIntl();
  const [memberToRemove, setMemberToRemove] =
    useState<TCompanyMemberWithDetails | null>(null);

  const openRemoveModal = (member: TCompanyMemberWithDetails) => {
    if (!hideRemoveConfirmModal) {
      setMemberToRemove(member);
    } else {
      onRemoveMember(member.email);
    }
  };

  const tableData = parseEntitiesToTableData(
    intl,
    companyGroups,
    openRemoveModal,
    onUpdateMemberPermission,
    companyMembers,
  );

  const handleCloseModal = () => {
    setMemberToRemove(null);
  };

  const handleRemoveMember = async () => {
    const email = memberToRemove?.email;
    if (email) {
      const { error } = (await onRemoveMember(email)) as any;
      !error && handleCloseModal();
    }
  };

  return (
    <div className={css.root}>
      <Table columns={TABLE_COLUMN} data={tableData} />
      <AlertModal
        isOpen={!!memberToRemove}
        handleClose={handleCloseModal}
        confirmDisabled={deleteMemberInProgress}
        cancelDisabled={deleteMemberInProgress}
        onCancel={handleCloseModal}
        onConfirm={handleRemoveMember}
        confirmInProgress={deleteMemberInProgress}
        confirmLabel={intl.formatMessage({
          id: 'ManageCompanyMembersTable.memberRemoveConfirm',
        })}
        cancelLabel={intl.formatMessage({
          id: 'ManageCompanyMembersTable.memberRemoveCancel',
        })}
        title={intl.formatMessage({
          id: 'ManageCompanyMembersTable.memberRemoveTitle',
        })}>
        <p className={css.removeContent}>
          {intl.formatMessage(
            {
              id: 'ManageCompanyMembersTable.memberRemoveContent',
            },
            {
              email: (
                <span className={css.boldText}>{memberToRemove?.email}</span>
              ),
            },
          )}
        </p>
      </AlertModal>
    </div>
  );
};

export default ManageCompanyMembersTable;
