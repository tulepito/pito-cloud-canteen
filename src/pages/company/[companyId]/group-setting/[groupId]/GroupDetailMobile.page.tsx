import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconMoreCircle from '@components/Icons/IconMoreCircle/IconMoreCircle';
import SlideModal from '@components/SlideModal/SlideModal';
import type { TRowData } from '@components/Table/Table';
import { getGroupListNames } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { companyPaths, personalPaths } from '@src/paths';
import { companyThunks } from '@src/redux/slices/company.slice';
import { ALLERGIES_OPTIONS, getLabelByKey } from '@src/utils/options';
import { User } from '@utils/data';
import type { TObject } from '@utils/types';

import AddNewMembersSlideModal from './components/AddNewMembersSlideModal/AddNewMembersSlideModal';
import GroupInfoForm from './components/GroupInfoForm/GroupInfoForm';
import MemberTable from './components/MemberTable/MemberTable';

import css from './GroupDetailMobile.module.scss';

const GroupDetailMobilePage = () => {
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
    value: isOpenMoreSlideModal,
    setTrue: onOpenMoreSlideModal,
    setFalse: onCloseMoreSlideModal,
  } = useBoolean();
  const {
    value: isDeleteGroupConfirmationModalOpen,
    setFalse: onDeleteGroupConfirmationModalClose,
    setTrue: openDeleteGroupConfirmationModal,
  } = useBoolean();

  const handleDeleteGroupConfirmationModal = () => {
    openDeleteGroupConfirmationModal();
    onCloseMoreSlideModal();
  };

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
        const groupNames = getGroupListNames(member, groupList ?? []);

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
              group: groupNames,
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

  useFetchCompanyInfo();

  useEffect(() => {
    dispatch(companyThunks.groupInfo());
    dispatch(
      companyThunks.groupDetailInfo({
        groupId: groupId as string,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          if (companyId === 'personal')
            router.push({
              pathname: personalPaths.GroupList,
              query: {
                companyId,
              },
            });
          else
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
    if (companyId === 'personal')
      router.push({
        pathname: personalPaths.GroupList,
        query: {
          companyId,
        },
      });
    else
      router.push({
        pathname: companyPaths.GroupSetting,
        query: {
          companyId,
        },
      });
  };

  const handleEditing = () => {
    onEditing();
    onCloseMoreSlideModal();
  };

  const onDeleteMember = (id: string, email: string) => {
    setDeletingMemberInfo({ id, email });
    openDeleteMemberConfirmationModal();
  };

  return (
    <div className={css.container}>
      <div className={css.headerContainer}>
        <div className={css.leftHeaderContainer} onClick={handleGoBack}>
          <IconArrow direction="left" />

          <span>{name || '---'}</span>
        </div>
        <IconMoreCircle onClick={onOpenMoreSlideModal} />
      </div>
      <div className={css.descriptionContainer}>{description}</div>
      <div className={css.tableContainer}>
        <MemberTable
          onDeleteMember={onDeleteMember}
          memberData={formattedGroupMembers}
          isLoading={fetchGroupDetailInProgress}
          handleAddNewMember={openAddNewMembersModal}
          pagination={groupMembersPagination}
        />
      </div>
      <AddNewMembersSlideModal
        isOpen={isAddNewMembersModalOpen}
        onClose={closeAddNewMembersModal}
        companyMembers={companyMembers}
        groupMembers={groupMembers}
        groupId={groupId as string}
      />
      <ConfirmationModal
        id="DeleteMemberModal"
        isPopup={true}
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
        isPopup={true}
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

      <SlideModal
        id="MoreActionSlideModal"
        isOpen={isOpenMoreSlideModal}
        onClose={onCloseMoreSlideModal}
        modalTitle={intl.formatMessage({
          id: 'GroupDetail.actionOther',
        })}>
        <div onClick={handleEditing} className={css.actionMoreItem}>
          <span>
            {intl.formatMessage({ id: 'GroupDetail.changeGroupName' })}
          </span>
        </div>
        <div
          onClick={handleDeleteGroupConfirmationModal}
          className={css.actionMoreItem}>
          <span>{intl.formatMessage({ id: 'GroupDetail.deleteGroup' })}</span>
        </div>
      </SlideModal>

      <SlideModal
        id="EditGroupDetailInfoSlideModal"
        isOpen={isEditing}
        onClose={closeEditing}
        modalTitle={intl.formatMessage({
          id: 'GroupDetail.renameGroup',
        })}>
        <GroupInfoForm
          groupId={groupId as string}
          onCallback={closeEditing}
          initialValues={groupInfoFormInitialValues}
        />
      </SlideModal>
    </div>
  );
};

export default GroupDetailMobilePage;
