import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconDelete from '@components/IconDelete/IconDelete';
import IconPlus from '@components/IconPlus/IconPlus';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { getGroupNames } from '@helpers/companyMembers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import {
  companyMemberThunks,
  resetError,
} from '@redux/slices/companyMember.slice';
import { ensureUser, USER } from '@utils/data';
import type { TUser } from '@utils/types';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

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
  const fetchCompanyInfoInProgress = useAppSelector(
    (state) => state.company.fetchCompanyInfoInProgress,
  );
  const deleteMemberInProgress = useAppSelector(
    (state) => state.companyMember.deleteMemberInProgress,
  );
  const deleteMemberError = useAppSelector(
    (state) => state.companyMember.deleteMemberError,
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
        return (
          <IconDelete className={css.deleteBtn} onClick={onDeleteMember} />
        );
      },
    },
  ];

  const formattedCompanyMembers = useMemo<TRowData[]>(
    () =>
      mergedCompanyMembers.reduce(
        (result: any, member: any) => [
          ...result,
          {
            key: member?.id?.uuid || member.attributes.email,
            data: {
              id: member?.id?.uuid,
              name: member.attributes.profile.displayName,
              email: member.attributes.email,
              group: getGroupNames(
                member.attributes.profile?.metadata?.groupList,
                groupList,
              ),
              allergy:
                USER(member).getPublicData()?.allergies?.join(', ') || [],
              nutrition:
                USER(member).getPublicData()?.nutritions?.join(', ') || [],
            },
          },
        ],
        [],
      ),
    [groupList, mergedCompanyMembers],
  );
  useEffect(() => {
    const fetchData = async () => {
      dispatch(resetError());
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(BookerManageCompany.companyInfo());
    };
    fetchData();
  }, [companyId, dispatch, router]);

  const onConfirmDeleteMember = useCallback(() => {
    dispatch(
      companyMemberThunks.deleteMember(deletingMemberEmail as string),
    ).then(async ({ error }: any) => {
      if (!error) {
        onDeleteMemberConfirmationModalClose();
        await dispatch(BookerManageCompany.companyInfo());
      }
    });
  }, [deletingMemberEmail, dispatch, onDeleteMemberConfirmationModalClose]);
  return (
    <div className={css.container}>
      <div className={css.header}>
        <div className={css.leftHeader}>
          <h2 className={css.title}>
            {intl.formatMessage({ id: 'MembersPage.membersTitle' })}
          </h2>
          <p className={css.description}>
            {intl.formatMessage({ id: 'MembersPage.membersDescription' })}
          </p>
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
        onConfirm={onConfirmDeleteMember}
        onCancel={onDeleteMemberConfirmationModalClose}
        hasError={deleteMemberError}
      />
    </div>
  );
};

export default MembersPage;
