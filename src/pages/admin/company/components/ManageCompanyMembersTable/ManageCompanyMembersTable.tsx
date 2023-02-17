import { InlineTextButton } from '@components/Button/Button';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { User } from '@utils/data';
import type {
  TCompany,
  TCompanyGroup,
  TCompanyMemberWithDetails,
} from '@utils/types';
import type { ReactNode } from 'react';
import React from 'react';

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
    render: ({ permission }) => {
      return <span>{permission}</span>;
    },
  },
  {
    key: 'groupName',
    label: 'Nhóm',
    render: ({ groupName }) => {
      return <span>{groupName}</span>;
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
    render: () => {
      return (
        <div className={css.actionButtons}>
          <InlineTextButton>
            <IconEdit />
          </InlineTextButton>
          <InlineTextButton>
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
  company: TCompany;
};

const parseEntitiesToTableData = (
  company: TCompany,
  companyMembers: TCompanyMemberWithDetails[] = [],
) => {
  return companyMembers.map((companyMember) => {
    const companyGroup = User(company).getMetadata().groups || [];
    const groupName = companyGroup.find(
      (group: TCompanyGroup) => group.id === companyMember.id,
    );

    return {
      key: companyMember.id.uuid,
      data: {
        permission: companyMember.permission,
        name: companyMember.attributes.profile.displayName,
        email: companyMember.attributes.email,
        groupName,
      },
    };
  });
};

const ManageCompanyMembersTable: React.FC<TManageCompanyMembersTable> = (
  props,
) => {
  const { companyMembers, company } = props;
  const tableData = parseEntitiesToTableData(company, companyMembers);
  return (
    <div className={css.root}>
      <Table columns={TABLE_COLUMN} data={tableData} />
    </div>
  );
};

export default ManageCompanyMembersTable;
