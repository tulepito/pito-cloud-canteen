import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import CreateGroupModal from '@components/CreateGroupModal/CreateGroupModal';
import IconDelete from '@components/IconDelete/IconDelete';
import IconEdit from '@components/IconEdit/IconEdit';
import IconOutlinePlus from '@components/IconOutlinePlus/IconOutlinePlus';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { BookerManageCompany } from '@src/redux/slices/company.slice';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
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
  const fetchCompanyInfoInProgress = useAppSelector(
    (state) => state.company.fetchCompanyInfoInProgress,
  );
  const deleteGroupInProgress = useAppSelector(
    (state) => state.company.deleteGroupInProgress,
  );
  const deletingGroupId = useAppSelector(
    (state) => state.company.deletingGroupId,
  );
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
          router.push(`/company/group-setting/${id}`);
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
    dispatch(BookerManageCompany.deleteGroup(selectingDeleteGroupId)).then(() =>
      onDeleteGroupConfirmationModalClose(),
    );
  };
  useEffect(() => {
    dispatch(BookerManageCompany.companyInfo());
  }, [dispatch]);
  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.titleWrapper}>
          <h2>{intl.formatMessage({ id: 'GroupSetting.pageTitle' })}</h2>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquid,
            accusantium! Iure porro veritatis, laboriosam non suscipit libero
            sint nesciunt numquam modi. Quam architecto in amet eius, esse vitae
            nemo saepe?
          </p>
        </div>
        <Button className={css.createGroupBtn} onClick={openCreateGroupModal}>
          <IconOutlinePlus />
          {intl.formatMessage({ id: 'GroupSetting.addGroup' })}
        </Button>
      </div>
      <div className={css.tableContainer}>
        <Table
          columns={TABLE_COLUMN}
          data={formattedGroupList}
          isLoading={fetchCompanyInfoInProgress}
        />
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
