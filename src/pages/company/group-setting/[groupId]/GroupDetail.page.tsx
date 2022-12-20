import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrow from '@components/IconArrow/IconArrow';
import IconDelete from '@components/IconDelete/IconDelete';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import useBoolean from '@hooks/useBoolean';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { BookerManageCompany } from '@src/redux/slices/company.slice';
import filter from 'lodash/filter';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';

import AddNewMembersModal from './components/AddNewMembersModal/AddNewMembersModal';
import GroupInfoForm from './components/GroupInfoForm/GroupInfoForm';
import css from './GroupDetail.module.scss';

const GroupDetailPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    value: isEditing,
    setTrue: onEditing,
    setFalse: closeEditing,
  } = useBoolean();
  const {
    value: isAddNewMembersModalOpen,
    setTrue: openAddNewMembersModal,
    setFalse: closeAddNewMembersModal,
  } = useBoolean();
  const {
    value: isDeleteMemberConfirmationModalOpen,
    setTrue: openDeleteMemberConfirmationModal,
    setFalse: closeDeleteMemberConfirmationModal,
  } = useBoolean();
  const {
    value: isDeleteGroupConfirmationModalOpen,
    setFalse: onDeleteGroupConfirmationModalClose,
    setTrue: openDeleteGroupConfirmationModal,
  } = useBoolean();

  const [deletingMemberInfo, setDeletingMemberInfo] =
    useState<Record<string, any>>();

  const { name, description } = useAppSelector(
    (state) => state.company.groupInfo,
    shallowEqual,
  );
  const groupList = useAppSelector(
    (state) => state.company.groupList,
    shallowEqual,
  );
  const groupMembers = useAppSelector(
    (state) => state.company.groupMembers,
    shallowEqual,
  );
  const fetchGroupDetailInProgress = useAppSelector(
    (state) => state.company.fetchGroupDetailInProgress,
  );
  const companyMembers = useAppSelector(
    (state) => state.company.companyMembers,
    shallowEqual,
  );
  const updateGroupInProgress = useAppSelector(
    (state) => state.company.updateGroupInProgress,
  );
  const deleteGroupInProgress = useAppSelector(
    (state) => state.company.deleteGroupInProgress,
  );

  const deleteGroupError = useAppSelector(
    (state) => state.company.deleteGroupError,
  );

  const updateGroupError = useAppSelector(
    (state) => state.company.updateGroupError,
  );
  const getGroupNames = (groupIds: string[]) => {
    return filter(groupList, (group: any) => groupIds.includes(group.id))
      .map((group: any) => group.name)
      .join(', ');
  };
  const formattedGroupMembers = useMemo<TRowData[]>(
    () =>
      groupMembers.reduce(
        (result: any, member: any) => [
          ...result,
          {
            key: member.id.uuid,
            data: {
              id: member.id.uuid,
              name: member.attributes.profile.displayName,
              email: member.attributes.email,
              group: getGroupNames(
                member.attributes.profile.metadata.groupList,
              ),
              allergy: [],
              nutrition: [],
            },
          },
        ],
        [],
      ),
    [groupMembers],
  );

  const TABLE_COLUMN: TColumn[] = [
    {
      key: 'name',
      label: 'Ten',
      render: (data: any) => {
        return <span>{data.name}</span>;
      },
    },
    {
      key: 'email',
      label: 'So thanh vien',
      render: (data: any) => {
        return <span>{data.email}</span>;
      },
    },
    {
      key: 'group',
      label: 'Nhom',
      render: (data: any) => {
        return <span>{data.group}</span>;
      },
    },
    {
      key: 'allergy',
      label: 'Di ung',
      render: (data: any) => {
        return <span>{data.allergy}</span>;
      },
    },
    {
      key: 'nutrition',
      label: 'Che do dinh duong',
      render: (data: any) => {
        return <span>{data.nutrition}</span>;
      },
    },
    {
      key: 'action',
      label: '',
      render: ({ id, email }: any) => {
        const onDeleteMember = () => {
          setDeletingMemberInfo({ id, email });
          openDeleteMemberConfirmationModal();
        };
        return updateGroupInProgress ? (
          <IconSpinner className={css.loading} />
        ) : (
          <IconDelete className={css.deleteBtn} onClick={onDeleteMember} />
        );
      },
    },
  ];
  const { groupId = '' } = router.query;
  useEffect(() => {
    dispatch(BookerManageCompany.companyInfo());
    dispatch(BookerManageCompany.groupInfo());
    dispatch(
      BookerManageCompany.groupDetailInfo({
        groupId: groupId as string,
      }),
    );
  }, [groupId]);

  const groupInfoFormInitialValues = useMemo(
    () => ({
      name,
      description,
    }),
    [name, description],
  );

  const onConfirmDeleteMember = () => {
    dispatch(
      BookerManageCompany.updateGroup({
        groupId,
        deletedMembers: [deletingMemberInfo],
      }),
    ).then(({ error }: any) => {
      if (!error) {
        closeDeleteMemberConfirmationModal();
      }
    });
  };

  const onConfirmDeleteGroup = () => {
    dispatch(BookerManageCompany.deleteGroup(groupId as string)).then(
      ({ error }: any) => {
        if (!error) onDeleteGroupConfirmationModalClose();
      },
    );
  };

  return (
    <div className={css.container}>
      <div className={css.backBtn}>
        <IconArrow direction="left" />
        Quay lai
      </div>
      <div className={css.header}>
        {isEditing ? (
          <GroupInfoForm
            groupId={groupId as string}
            onCallback={closeEditing}
            initialValues={groupInfoFormInitialValues}
          />
        ) : (
          <>
            <div className={css.titleWrapper}>
              <h2>{name || '---'}</h2>
              <p>{description || '---'}</p>
            </div>
            <div className={css.actionBtns}>
              <Button onClick={onEditing} className={css.changeNameBtn}>
                Doi ten
              </Button>
              <Button
                onClick={openDeleteGroupConfirmationModal}
                className={css.deleteGroupBtn}>
                Xoa nhom
              </Button>
            </div>
          </>
        )}
      </div>
      <div className={css.container}>
        <Table
          columns={TABLE_COLUMN}
          data={formattedGroupMembers}
          isLoading={fetchGroupDetailInProgress}
        />
        <Button className={css.addMemberBtn} onClick={openAddNewMembersModal}>
          + &nbsp;Them thanh vien nhom
        </Button>
      </div>
      <AddNewMembersModal
        isOpen={isAddNewMembersModalOpen}
        onClose={closeAddNewMembersModal}
        companyMembers={companyMembers}
        groupMembers={groupMembers}
        groupId={groupId as string}
      />
      <ConfirmationModal
        id="DeleteMemberModal"
        isOpen={isDeleteMemberConfirmationModalOpen}
        onClose={closeDeleteMemberConfirmationModal}
        confirmText="Dong y"
        cancelText="Bo qua"
        title={`Ban co muon xoa khong?`}
        isConfirmButtonLoading={updateGroupInProgress}
        onConfirm={onConfirmDeleteMember}
        onCancel={closeDeleteMemberConfirmationModal}
        hasError={updateGroupError}
      />
      <ConfirmationModal
        id="DeleteGroupModal"
        isOpen={isDeleteGroupConfirmationModalOpen}
        onClose={onDeleteGroupConfirmationModalClose}
        confirmText="Dong y"
        cancelText="Bo qua"
        title={`Ban co muon xoa nhom khong?`}
        isConfirmButtonLoading={deleteGroupInProgress}
        onConfirm={onConfirmDeleteGroup}
        onCancel={onDeleteGroupConfirmationModalClose}
        hasError={deleteGroupError}
      />
    </div>
  );
};

export default GroupDetailPage;
