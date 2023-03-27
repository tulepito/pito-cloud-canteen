import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { InlineTextButton } from '@components/Button/Button';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import AlertModal from '@components/Modal/AlertModal';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import type { TCompanyGroup } from '@utils/types';

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

      return <span className={css.boldText}>{name}</span>;
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
    render: ({ onSelectGroup, onOpenRemoveModal }) => {
      return (
        <div className={css.actionButtons}>
          <InlineTextButton type="button" onClick={onSelectGroup}>
            <IconEdit />
          </InlineTextButton>
          <InlineTextButton type="button" onClick={onOpenRemoveModal}>
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
  onSelectGroup: (id: string) => void;
  onRemoveGroup: (id: string) => void;
  deleteGroupInProgress: boolean;
  deleteGroupError: any;
};

const parseEntitiesToTableData = (
  companyGroups: TCompanyGroup[],
  {
    onSelectGroup,
    onOpenRemoveModal,
  }: {
    onSelectGroup: (id: string) => void;
    onOpenRemoveModal: (group: TCompanyGroup) => void;
  },
) => {
  return companyGroups.map((group) => {
    const handleSelectGroup = () => {
      onSelectGroup(group.id);
    };
    const handleOpenRemoveModal = () => {
      onOpenRemoveModal(group);
    };

    return {
      key: group.id,
      data: {
        id: group.id,
        name: group.name,
        membersLength: group.members.length,
        onSelectGroup: handleSelectGroup,
        onOpenRemoveModal: handleOpenRemoveModal,
      },
    };
  });
};

const ManageCompanyGroupsTable: React.FC<TManageCompanyGroupsTable> = (
  props,
) => {
  const {
    companyGroups = [],
    onSelectGroup,
    onRemoveGroup,
    deleteGroupInProgress,
  } = props;
  const [groupToRemove, setGroupToRemove] = useState<TCompanyGroup | null>(
    null,
  );
  const intl = useIntl();
  const onOpenRemoveModal = (group: TCompanyGroup) => {
    setGroupToRemove(group);
  };

  const onCloseRemoveModal = () => {
    setGroupToRemove(null);
  };

  const handleRemoveGroup = async () => {
    if (!groupToRemove) return;
    const { error } = (await onRemoveGroup(groupToRemove.id)) as any;
    if (!error) onCloseRemoveModal();
  };

  const tableData = parseEntitiesToTableData(companyGroups, {
    onSelectGroup,
    onOpenRemoveModal,
  });

  return (
    <div className={css.root}>
      <Table
        columns={TABLE_COLUMN}
        data={tableData}
        tableBodyCellClassName={css.tableBodyCell}
      />
      <AlertModal
        onConfirm={handleRemoveGroup}
        isOpen={!!groupToRemove}
        confirmInProgress={deleteGroupInProgress}
        confirmDisabled={deleteGroupInProgress}
        cancelDisabled={deleteGroupInProgress}
        title={intl.formatMessage({
          id: 'ManageCompanyGroupsTable.groupRemoveModal',
        })}
        handleClose={onCloseRemoveModal}
        onCancel={onCloseRemoveModal}
        confirmLabel={intl.formatMessage({
          id: 'ManageCompanyGroupsTable.confirmModal',
        })}
        cancelLabel={intl.formatMessage({
          id: 'ManageCompanyGroupsTable.cancelModal',
        })}>
        <p className={css.removeContent}>
          {intl.formatMessage(
            {
              id: 'ManageCompanyGroupsTable.removeGroupContent',
            },
            {
              name: <span className={css.boldText}>{groupToRemove?.name}</span>,
            },
          )}
        </p>
      </AlertModal>
    </div>
  );
};

export default ManageCompanyGroupsTable;
