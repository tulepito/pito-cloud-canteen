import { InlineTextButton } from '@components/Button/Button';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import type { TCompanyGroup } from '@utils/types';
import type { ReactNode } from 'react';
import React from 'react';

import css from './ManageCompanyGroupsTable.module.scss';

type ManageCompaniesMemberTableEntity = {
  name: string;
  membersLength: number;
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
    label: 'Tên nhóm',
    render: (data) => {
      const { name } = data;
      return <span>{name}</span>;
    },
  },
  {
    key: 'membersLength',
    label: 'Số thành viên',
    render: ({ membersLength }) => {
      return <span>{membersLength}</span>;
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

type TManageCompanyGroupsTable = {
  className?: string;
  companyGroups: TCompanyGroup[];
};

const parseEntitiesToTableData = (companyGroups: TCompanyGroup[]) => {
  return companyGroups.map((group) => {
    return {
      key: group.id,
      data: {
        name: group.name,
        membersLength: group.members.length,
      },
    };
  });
};

const ManageCompanyGroupsTable: React.FC<TManageCompanyGroupsTable> = (
  props,
) => {
  const { companyGroups = [] } = props;
  const tableData = parseEntitiesToTableData(companyGroups);
  return (
    <div className={css.root}>
      <Table columns={TABLE_COLUMN} data={tableData} />
    </div>
  );
};

export default ManageCompanyGroupsTable;
