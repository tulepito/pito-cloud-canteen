import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import CreateGroupModal from '@components/CreateGroupModal/CreateGroupModal';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconOutlinePlus from '@components/Icons/IconOutlinePlus/IconOutlinePlus';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import IconNoClientsFound from '@src/pages/admin/order/create/components/ClientTable/IconNoClientsFound';
import {
  addWorkspaceCompanyId,
  companyThunks,
} from '@src/redux/slices/company.slice';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './GroupSetting.module.scss';

type TGroupItem = {
  id: string;
  groupName: string;
  memberNumber: string;
};
const GroupSettingPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const { companyId = '' } = router.query;
  const dispatch = useAppDispatch();
  const {
    value: isOpenCreateGroupModal,
    setFalse: onClose,
    setTrue: openCreateGroupModal,
  } = useBoolean();

  const {
    value: isDeleteGroupConfirmationModalOpen,
    setFalse: onDeleteGroupConfirmationModalClose,
    setTrue: openDeleteGroupConfirmationModal,
  } = useBoolean();

  const [selectingDeleteGroupId, setSelectingDeleteGroupId] =
    useState<string>('');
  const groupList = useAppSelector(
    (state) => state.company.groupList,
    shallowEqual,
  );
  const companyMembers = useAppSelector(
    (state) => state.company.companyMembers,
    shallowEqual,
  );
  const { fetchCompanyInfoInProgress, deleteGroupInProgress, deletingGroupId } =
    useAppSelector((state) => state.company);
  const originCompanyMembers = useAppSelector(
    (state) => state.company.originCompanyMembers,
    shallowEqual,
  );

  const formattedGroupList = useMemo<TRowData[]>(
    () =>
      groupList.reduce(
        (result: any, group: any) => [
          ...result,
          {
            key: group.id,
            data: {
              id: group.id,
              groupName: group.name,
              memberNumber: group.members.length,
            },
          },
        ],
        [],
      ),
    [groupList],
  );

  const TABLE_COLUMN: TColumn[] = [
    {
      key: 'groupName',
      label: intl.formatMessage({ id: 'GroupSetting.columnLabel.groupName' }),
      render: (data: any) => {
        return <span>{data.groupName}</span>;
      },
    },
    {
      key: 'memberNumber',
      label: intl.formatMessage({
        id: 'GroupSetting.columnLabel.memberNumber',
      }),
      render: (data: any) => {
        return <span>{data.memberNumber}</span>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: ({ id }: TGroupItem) => {
        const showLoadingIcon = deleteGroupInProgress && id === deletingGroupId;
        const onEditGroup = () => {
          router.push({
            pathname: `/company/[companyId]/group-setting/${id}`,
            query: router.query,
          });
        };
        const onDeleteGroup = () => {
          setSelectingDeleteGroupId(id);
          openDeleteGroupConfirmationModal();
        };
        return (
          <>
            <IconEdit className={css.editBtn} onClick={onEditGroup} />
            {showLoadingIcon ? (
              <IconSpinner className={css.loading} />
            ) : (
              <IconDelete className={css.deleteBtn} onClick={onDeleteGroup} />
            )}
          </>
        );
      },
    },
  ];

  const onConfirmDeleteGroup = () => {
    dispatch(companyThunks.deleteGroup(selectingDeleteGroupId)).then(() =>
      onDeleteGroupConfirmationModalClose(),
    );
  };

  useEffect(() => {
    dispatch(addWorkspaceCompanyId(companyId));
  }, [companyId, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(companyThunks.companyInfo());
    };
    fetchData();
  }, [companyId, dispatch, router]);

  const noGroupFound = (
    <div className={css.noGroupFound}>
      <IconNoClientsFound />
      <div>
        <FormattedMessage id="GroupSetting.noGroupFound" />
      </div>
    </div>
  );

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleWrapper}>
          <h2>{intl.formatMessage({ id: 'GroupSetting.pageTitle' })}</h2>
        </div>
        <Button className={css.createGroupBtn} onClick={openCreateGroupModal}>
          <IconOutlinePlus />
          {intl.formatMessage({ id: 'GroupSetting.addGroup' })}
        </Button>
      </div>
      <div className={css.tableContainer}>
        {formattedGroupList && formattedGroupList.length > 0 ? (
          <Table
            columns={TABLE_COLUMN}
            data={formattedGroupList}
            isLoading={fetchCompanyInfoInProgress}
            tableClassName={css.tableRoot}
            tableHeadClassName={css.tableHead}
            tableHeadCellClassName={css.tableHeadCell}
            tableBodyClassName={css.tableBody}
            tableBodyRowClassName={css.tableBodyRow}
            tableBodyCellClassName={css.tableBodyCell}
          />
        ) : (
          noGroupFound
        )}
      </div>
      <CreateGroupModal
        isOpen={isOpenCreateGroupModal}
        onClose={onClose}
        companyMembers={companyMembers}
        originCompanyMembers={originCompanyMembers}
      />
      <ConfirmationModal
        id="DeleteGroupModal"
        isOpen={isDeleteGroupConfirmationModalOpen}
        onClose={onDeleteGroupConfirmationModalClose}
        confirmText={intl.formatMessage({ id: 'GroupSetting.confirmText' })}
        cancelText={intl.formatMessage({ id: 'GroupSetting.cancelText' })}
        title={intl.formatMessage({ id: 'GroupSetting.deleteGroupModalTitle' })}
        isConfirmButtonLoading={deleteGroupInProgress}
        onConfirm={onConfirmDeleteGroup}
        onCancel={onDeleteGroupConfirmationModalClose}
      />
    </div>
  );
};

export default GroupSettingPage;
