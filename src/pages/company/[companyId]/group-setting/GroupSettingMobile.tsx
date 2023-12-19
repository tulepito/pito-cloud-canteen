import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import CreateGroupSlideModal from '@components/CreateGroupSlideModal/CreateGroupSlideModal';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn, TRowData } from '@components/Table/Table';
import { getCompanyIdFromBookerUser } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import IconNoClientsFound from '@src/pages/admin/order/components/ClientTable/IconNoClientsFound';
import { companyPaths, personalPaths } from '@src/paths';
import {
  addWorkspaceCompanyId,
  companyThunks,
} from '@src/redux/slices/company.slice';

import GroupSettingTable from './components/GroupSettingTable/GroupSettingTable';

import css from './GroupSettingMobile.module.scss';

const GroupSettingMobile = () => {
  const intl = useIntl();
  const router = useRouter();

  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );
  let { companyId } = router.query;
  let editGroupByIdPath = companyPaths.GroupDetail;
  if (companyId === 'personal') {
    companyId = getCompanyIdFromBookerUser(currentUser!);
    editGroupByIdPath = personalPaths.GroupList;
  }

  const dispatch = useAppDispatch();
  const {
    value: isCreateGroupModalOpen,
    setFalse: handleCloseCreateGroupModal,
    setTrue: handleOpenCreateGroupModal,
  } = useBoolean();

  const {
    value: isDeleteGroupConfirmationModalOpen,
    setFalse: handleCloseDeleteGroupConfirmationModal,
    setTrue: handleOpenDeleteGroupConfirmationModal,
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

  const onEditGroupById = (id: string) => {
    router.push({
      pathname: `${editGroupByIdPath}/${id}`,
      query: router.query,
    });
  };
  const onDeleteGroupById = (id: string) => {
    setSelectingDeleteGroupId(id);
    handleOpenDeleteGroupConfirmationModal();
  };

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
        return (
          <div className={css.groupName}>
            <span>{data.groupName}</span>
          </div>
        );
      },
    },
    {
      key: 'memberNumber',
      label: intl.formatMessage({
        id: 'GroupSetting.columnLabel.memberNumber',
      }),
      render: (data: any) => {
        const { id } = data;
        const showLoadingIcon = deleteGroupInProgress && id === deletingGroupId;
        const onDeleteGroup = () => {
          onDeleteGroupById(id);
        };

        const onEditGroup = () => {
          onEditGroupById(id);
        };

        return (
          <div className={css.memberNumberContainer}>
            <div className={css.memberNumberValue}>
              <span>{data.memberNumber}</span>
            </div>
            <div className={css.memberNumberActionContainer}>
              <IconEdit
                variant="outline"
                width={32}
                height={32}
                className={css.editBtn}
                onClick={onEditGroup}
              />
              {showLoadingIcon ? (
                <IconSpinner className={css.loading} />
              ) : (
                <IconDelete
                  variant="outline"
                  width={32}
                  height={32}
                  className={css.deleteBtn}
                  onClick={onDeleteGroup}
                />
              )}
            </div>
          </div>
        );
      },
    },
  ];

  const handleConfirmDeleteGroup = () => {
    dispatch(companyThunks.deleteGroup(selectingDeleteGroupId)).then(() =>
      handleCloseDeleteGroupConfirmationModal(),
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(companyThunks.companyInfo());
    };
    if (companyId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  return (
    <div className={css.container}>
      <RenderWhen
        condition={
          formattedGroupList?.length > 0 || fetchCompanyInfoInProgress
        }>
        <div className={css.tableContainer}>
          <GroupSettingTable
            columns={TABLE_COLUMN}
            data={formattedGroupList}
            isLoading={fetchCompanyInfoInProgress}
            handleOpenCreateGroupModal={handleOpenCreateGroupModal}
          />
        </div>
        <RenderWhen.False>
          <div className={css.containerNoGroupFoud}>
            <div className={css.noGroupFound}>
              <IconNoClientsFound />
              <FormattedMessage id="GroupSetting.noGroupFound" />
            </div>
            <Button
              variant="primary"
              size="large"
              className={css.addGroup}
              onClick={handleOpenCreateGroupModal}>
              {intl.formatMessage({
                id: 'GroupSetting.addGroup',
              })}
            </Button>
          </div>
        </RenderWhen.False>
      </RenderWhen>

      <CreateGroupSlideModal
        isOpen={isCreateGroupModalOpen}
        onClose={handleCloseCreateGroupModal}
        companyMembers={companyMembers}
        originCompanyMembers={originCompanyMembers}
      />
      <ConfirmationModal
        id="DeleteGroupModal"
        isPopup={true}
        isOpen={isDeleteGroupConfirmationModalOpen}
        onClose={handleCloseDeleteGroupConfirmationModal}
        confirmText={intl.formatMessage({ id: 'GroupSetting.confirmText' })}
        cancelText={intl.formatMessage({ id: 'GroupSetting.cancelText' })}
        title={intl.formatMessage({ id: 'GroupSetting.deleteGroupModalTitle' })}
        isConfirmButtonLoading={deleteGroupInProgress}
        onConfirm={handleConfirmDeleteGroup}
        onCancel={handleCloseDeleteGroupConfirmationModal}
      />
    </div>
  );
};

export default GroupSettingMobile;
