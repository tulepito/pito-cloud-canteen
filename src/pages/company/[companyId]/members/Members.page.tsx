/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { getGroupNames } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  addWorkspaceCompanyId,
  companyThunks,
} from '@redux/slices/company.slice';
import {
  companyMemberActions,
  companyMemberThunks,
} from '@redux/slices/companyMember.slice';
import {
  CompanyPermissions,
  UserInviteStatus,
} from '@src/types/UserPermission';
import { ALLERGIES_OPTIONS, getLabelByKey } from '@src/utils/options';
import { ensureUser, User } from '@utils/data';
import type { TObject, TUser } from '@utils/types';

import AddCompanyMembersModal from './components/AddCompanyMembersModal/AddCompanyMembersModal';

import css from './Members.module.scss';

const MembersPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { companyId = '' } = router.query;
  const companyMembers = useAppSelector(
    (state) => state.company.companyMembers,
    shallowEqual,
  );
  const originCompanyMembers = useAppSelector(
    (state) => state.company.originCompanyMembers,
    shallowEqual,
  );
  const nutritions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );

  const originNoFlexAccountMembers = useMemo(() => {
    const filteredResult = Object.keys(originCompanyMembers).filter(
      (memberEmail: any) => !originCompanyMembers[memberEmail].id,
    );

    return filteredResult.map((userEmail: string) => {
      const initialUser = {
        attributes: {
          email: userEmail,
        },
      } as TUser;

      return ensureUser(initialUser);
    });
  }, [originCompanyMembers]);

  const mergedCompanyMembers = useMemo(
    () => [...originNoFlexAccountMembers, ...companyMembers],
    [originNoFlexAccountMembers, companyMembers],
  );
  const groupList = useAppSelector(
    (state) => state.company.groupList,
    shallowEqual,
  );
  const { fetchCompanyInfoInProgress } = useAppSelector(
    (state) => state.company,
  );
  const { deleteMemberInProgress, deleteMemberError } = useAppSelector(
    (state) => state.companyMember,
  );
  const bookerMemberEmails = Object.values(originCompanyMembers).reduce(
    (result, _member) => {
      if (
        CompanyPermissions.includes(_member.permission) &&
        _member.inviteStatus === UserInviteStatus.ACCEPTED
      ) {
        return [...result, _member.email];
      }

      return result;
    },
    [],
  );

  const [deletingMemberEmail, setDeletingMemberEmail] = useState<string>();
  const {
    value: isAddMembersModalOpen,
    setTrue: onAddMembersModalOpen,
    setFalse: onAddModalMembersModalClose,
  } = useBoolean();

  const {
    value: isDeleteMemberConfirmationModalOpen,
    setFalse: onDeleteMemberConfirmationModalClose,
    setTrue: openDeleteMemberConfirmationModal,
  } = useBoolean();

  const goToMemberDetailPage = (memberEmail: string) => () => {
    router.push({
      pathname: '/company/[companyId]/members/[memberEmail]',
      query: {
        companyId,
        memberEmail,
      },
    });
  };

  const TABLE_COLUMN: TColumn[] = [
    {
      key: 'name',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.name' }),
      render: (data: any) => {
        return <span>{data.name || '-'}</span>;
      },
    },
    {
      key: 'email',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.email' }),
      render: (data: any) => {
        return (
          <span
            className={css.clickable}
            onClick={goToMemberDetailPage(data.email)}>
            {data.email}
          </span>
        );
      },
    },
    {
      key: 'group',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.group' }),
      render: (data: any) => {
        return <span>{data.group || '-'}</span>;
      },
    },
    {
      key: 'allergy',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.allergy' }),
      render: (data: any) => {
        return <span>{data.allergy || '-'}</span>;
      },
    },
    {
      key: 'nutrition',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.nutrition' }),
      render: (data: any) => {
        return <span>{data.nutrition || '-'}</span>;
      },
    },
    {
      key: 'action',
      label: '',
      render: ({ email }: any) => {
        const onDeleteMember = () => {
          setDeletingMemberEmail(email);
          openDeleteMemberConfirmationModal();
        };
        const showDeleteBtn =
          bookerMemberEmails.length > 0 && !bookerMemberEmails.includes(email);

        return showDeleteBtn ? (
          <IconDelete className={css.deleteBtn} onClick={onDeleteMember} />
        ) : null;
      },
    },
  ];

  const formattedCompanyMembers = useMemo<TRowData[]>(
    () =>
      mergedCompanyMembers
        .reduce((result: any, member: any) => {
          const id = member?.id?.uuid;
          const email = member?.attributes?.email;
          const memberGroupIds = groupList.reduce(
            (groupIds: string[], curr: TObject) => {
              const { members = [], id: groupId } = curr || {};

              if (
                typeof members.find(
                  ({
                    id: memberIdFromGroup,
                    email: memberEmailFromGroup,
                  }: TObject) => {
                    return (
                      memberIdFromGroup === id || memberEmailFromGroup === email
                    );
                  },
                ) !== 'undefined'
              ) {
                return [...groupIds, groupId];
              }

              return groupIds;
            },
            [],
          );

          return [
            ...result,
            {
              key: id || email,
              data: {
                id,
                name: `${member.attributes.profile?.lastName || ''} ${
                  member.attributes.profile?.firstName || ''
                }`,
                email,
                group: getGroupNames(memberGroupIds, groupList),
                allergy:
                  User(member)
                    .getPublicData()
                    ?.allergies?.map((allergy: string) =>
                      getLabelByKey(ALLERGIES_OPTIONS, allergy),
                    )
                    .join(', ') || [],
                nutrition:
                  User(member)
                    .getPublicData()
                    ?.nutritions?.map((nutrition: string) =>
                      getLabelByKey(nutritions, nutrition),
                    )
                    ?.join(', ') || [],
              },
            },
          ];
        }, [])
        .filter((item: TObject) => !!item?.data?.id),
    [
      JSON.stringify(groupList),
      JSON.stringify(mergedCompanyMembers),
      JSON.stringify(nutritions),
    ],
  );

  console.log({ formattedCompanyMembers });

  useEffect(() => {
    const fetchData = async () => {
      dispatch(companyMemberActions.resetError());
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(companyThunks.companyInfo());
    };
    if (companyId) fetchData();
  }, [companyId]);

  const handleConfirmDeleteMember = useCallback(() => {
    dispatch(
      companyMemberThunks.deleteMember(deletingMemberEmail as string),
    ).then(async ({ error }: any) => {
      if (!error) {
        onDeleteMemberConfirmationModalClose();
        await dispatch(companyThunks.companyInfo());
      }
    });
  }, [deletingMemberEmail, onDeleteMemberConfirmationModalClose]);

  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.leftHeader}>
          <h2 className={css.title}>
            {intl.formatMessage({ id: 'MembersPage.membersTitle' })}
          </h2>
        </div>
        <div className={css.rightHeader}>
          <Button className={css.addMemberBtn} onClick={onAddMembersModalOpen}>
            <IconPlus className={css.plusIcon} />
            {intl.formatMessage({ id: 'MembersPage.addMember' })}
          </Button>
        </div>
      </div>
      <div className={css.tableContainer}>
        <div className={css.tableBorder}>
          <Table
            columns={TABLE_COLUMN}
            data={formattedCompanyMembers}
            isLoading={fetchCompanyInfoInProgress}
            tableClassName={css.tableRoot}
            tableHeadClassName={css.tableHead}
            tableHeadCellClassName={css.tableHeadCell}
            tableBodyClassName={css.tableBody}
            tableBodyRowClassName={css.tableBodyRow}
            tableBodyCellClassName={css.tableBodyCell}
          />
        </div>
      </div>
      <AddCompanyMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={onAddModalMembersModalClose}
      />
      <ConfirmationModal
        id="DeleteMemberConfirmationModal"
        isOpen={isDeleteMemberConfirmationModalOpen}
        onClose={onDeleteMemberConfirmationModalClose}
        confirmText={intl.formatMessage({
          id: 'MembersPage.confirmDeleteMemberText',
        })}
        cancelText={intl.formatMessage({
          id: 'MembersPage.cancelDeleteMemberText',
        })}
        title={intl.formatMessage({
          id: 'MembersPage.deleteMemberModalTitle',
        })}
        isConfirmButtonLoading={deleteMemberInProgress}
        onConfirm={handleConfirmDeleteMember}
        onCancel={onDeleteMemberConfirmationModalClose}
        hasError={deleteMemberError}
      />
    </div>
  );
};

export default MembersPage;
