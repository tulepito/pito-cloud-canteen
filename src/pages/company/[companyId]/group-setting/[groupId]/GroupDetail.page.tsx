/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { getGroupListNames } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { companyPaths } from '@src/paths';
import { companyThunks } from '@src/redux/slices/company.slice';
import { ALLERGIES_OPTIONS, getLabelByKey } from '@src/utils/options';
import { User } from '@utils/data';
import type { TObject } from '@utils/types';

import AddNewMembersModal from './components/AddNewMembersModal/AddNewMembersModal';
import GroupInfoForm from './components/GroupInfoForm/GroupInfoForm';

import css from './GroupDetail.module.scss';

const GroupDetailPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { groupId = '', companyId = '' } = router.query;
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

  const [deletingMemberInfo, setDeletingMemberInfo] = useState<TObject>();

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
  const groupMembersPagination = useAppSelector(
    (state) => state.company.groupMembersPagination,
    shallowEqual,
  );
  const companyMembers = useAppSelector(
    (state) => state.company.companyMembers,
    shallowEqual,
  );
  const nutritions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );

  const {
    fetchGroupDetailInProgress,
    updateGroupInProgress,
    deleteGroupInProgress,
    deleteGroupError,
    updateGroupError,
  } = useAppSelector((state) => state.company);

  const formattedGroupMembers = useMemo<TRowData[]>(
    () =>
      groupMembers.reduce((result: any, member: any) => {
        const groupName = getGroupListNames(member, groupList ?? []);

        return [
          ...result,
          {
            key: User(member).getId(),
            data: {
              id: User(member).getId(),
              name: `${member.attributes.profile?.lastName || ''} ${
                member.attributes.profile?.firstName || ''
              }`,
              email: User(member).getAttributes().email,
              group: groupName,
              allergy: User(member)
                .getPublicData()
                ?.allergies?.map((allergy: string) =>
                  getLabelByKey(ALLERGIES_OPTIONS, allergy),
                )
                .join(', '),
              nutrition: User(member)
                .getPublicData()
                ?.nutritions?.map((nutrition: string) =>
                  getLabelByKey(nutritions, nutrition),
                )
                ?.join(', '),
            },
          },
        ];
      }, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(groupMembers)],
  );

  const goToGroupMemberDetailPage = (memberId: string) => () => {
    router.push({
      pathname: companyPaths.GroupMemberDetail,
      query: {
        companyId,
        groupId,
        memberId,
      },
    });
  };

  const TABLE_COLUMN: TColumn[] = [
    {
      key: 'name',
      label: intl.formatMessage({ id: 'GroupDetail.columnLabel.name' }),
      render: (data: any) => {
        return <span>{data.name}</span>;
      },
    },
    {
      key: 'email',
      label: intl.formatMessage({ id: 'GroupDetail.columnLabel.email' }),
      render: ({ id, email }: TObject) => {
        return (
          <span
            className={css.clickable}
            onClick={goToGroupMemberDetailPage(id)}>
            {email}
          </span>
        );
      },
    },
    {
      key: 'group',
      label: intl.formatMessage({ id: 'GroupDetail.columnLabel.group' }),
      render: (data: any) => {
        return <span>{data.group}</span>;
      },
    },
    {
      key: 'allergy',
      label: intl.formatMessage({ id: 'GroupDetail.columnLabel.allergy' }),
      render: (data: any) => {
        return <span>{isEmpty(data.allergy) ? '-' : data.allergy}</span>;
      },
    },
    {
      key: 'nutrition',
      label: intl.formatMessage({ id: 'GroupDetail.columnLabel.nutrition' }),
      render: (data: any) => {
        return <span>{isEmpty(data.nutrition) ? '-' : data.nutrition}</span>;
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

  useFetchCompanyInfo();
  useEffect(() => {
    dispatch(companyThunks.groupInfo());
    dispatch(
      companyThunks.groupDetailInfo({
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

  const handleConfirmDeleteMember = async () => {
    const { meta } = await dispatch(
      companyThunks.updateGroup({
        groupId,
        deletedMembers: [deletingMemberInfo],
      }),
    );
    if (meta.requestStatus !== 'rejected') {
      closeDeleteMemberConfirmationModal();
      await dispatch(
        companyThunks.groupDetailInfo({
          groupId: groupId as string,
        }),
      );
    }
  };

  const handleConfirmDeleteGroup = () => {
    dispatch(companyThunks.deleteGroup(groupId as string)).then(
      ({ error }: any) => {
        if (!error) {
          onDeleteGroupConfirmationModalClose();
          router.push({
            pathname: companyPaths.GroupSetting,
            query: {
              companyId,
            },
          });
        }
      },
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={css.container}>
      <div className={css.backBtn} onClick={handleGoBack}>
        <IconArrow direction="left" />
        {intl.formatMessage({ id: 'GroupDetail.backButton' })}
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
              <div className={css.descriptionContainer}>{description}</div>
            </div>
            <div className={css.actionBtns}>
              <Button onClick={onEditing} className={css.changeNameBtn}>
                {intl.formatMessage({ id: 'GroupDetail.changeGroupName' })}
              </Button>
              <Button
                onClick={openDeleteGroupConfirmationModal}
                className={css.deleteGroupBtn}>
                {intl.formatMessage({ id: 'GroupDetail.deleteGroup' })}
              </Button>
            </div>
          </>
        )}
      </div>
      <div className={css.tableContainer}>
        <Table
          columns={TABLE_COLUMN}
          data={formattedGroupMembers}
          isLoading={fetchGroupDetailInProgress}
          tableClassName={css.tableRoot}
          tableHeadClassName={css.tableHead}
          tableHeadCellClassName={css.tableHeadCell}
          tableHeadCellLabelClassName={css.tableHeadCellLabel}
          tableBodyClassName={css.tableBody}
          tableBodyRowClassName={css.tableBodyRow}
          tableBodyCellClassName={css.tableBodyCell}
          pagination={groupMembersPagination}
          extraRows={
            <td className={css.addMemberBtn} onClick={openAddNewMembersModal}>
              <IconPlus className={css.plusIcon} />
              {intl.formatMessage({ id: 'GroupDetail.addGroupMember' })}
            </td>
          }
        />
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
        confirmText={intl.formatMessage({
          id: 'GroupDetail.confirmDeleteMemberText',
        })}
        cancelText={intl.formatMessage({
          id: 'GroupDetail.cancelDeleteMemberText',
        })}
        title={intl.formatMessage({
          id: 'GroupDetail.deleteMemberModalTitle',
        })}
        isConfirmButtonLoading={updateGroupInProgress}
        onConfirm={handleConfirmDeleteMember}
        onCancel={closeDeleteMemberConfirmationModal}
        hasError={updateGroupError}
      />
      <ConfirmationModal
        id="DeleteGroupModal"
        isOpen={isDeleteGroupConfirmationModalOpen}
        onClose={onDeleteGroupConfirmationModalClose}
        confirmText={intl.formatMessage({
          id: 'GroupDetail.confirmDeleteGroupText',
        })}
        cancelText={intl.formatMessage({
          id: 'GroupDetail.cancelDeleteGroupText',
        })}
        title={intl.formatMessage({
          id: 'GroupDetail.deleteGroupModalTitle',
        })}
        isConfirmButtonLoading={deleteGroupInProgress}
        onConfirm={handleConfirmDeleteGroup}
        onCancel={onDeleteGroupConfirmationModalClose}
        hasError={deleteGroupError}
      />
    </div>
  );
};

export default GroupDetailPage;
