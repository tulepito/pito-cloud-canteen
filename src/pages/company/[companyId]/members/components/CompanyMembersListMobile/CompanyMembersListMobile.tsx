/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconPlusBlackFill from '@components/Icons/IconPlusBlackFill/IconPlusBlackFill';
import type { TColumn, TRowData } from '@components/Table/Table';
import { getCompanyIdFromBookerUser, getGroupNames } from '@helpers/company';
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

import AddCompanyMembersSlideModal from './AddCompanyMembersSlideModal/AddCompanyMembersSlideModal';
import CompanyCollapsibleRows from './CompanyCollapsibleRows/CompanyCollapsibleRows';

import css from './CompanyMembersListMobile.module.scss';

type CompanyMembersListMobileProps = {};
const CompanyMembersListMobile: React.FC<
  CompanyMembersListMobileProps
> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { companyId } = router.query;
  const addNewMembersController = useBoolean();

  const handleCloseNewMembersModal = () => addNewMembersController.setFalse();
  const handleOpenNewMembersModal = () => addNewMembersController.setTrue();

  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );
  const { deleteMemberInProgress, deleteMemberError } = useAppSelector(
    (state) => state.companyMember,
  );
  const [deletingMemberEmail, setDeletingMemberEmail] = useState<string>();
  const {
    value: isDeleteMemberConfirmationModalOpen,
    setFalse: onDeleteMemberConfirmationModalClose,
    setTrue: openDeleteMemberConfirmationModal,
  } = useBoolean();

  const onDeleteMember = (email: string) => {
    setDeletingMemberEmail(email);
    openDeleteMemberConfirmationModal();
  };

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

  const columns: TColumn[] = [
    {
      key: 'name',
      label: intl
        .formatMessage({ id: 'MembersPage.columnLabel.name' })
        .toUpperCase(),
      render: (data: any) => {
        return (
          <div className={css.columnContainer}>
            <span className={css.cellNameValue}>{data.name}</span>
          </div>
        );
      },
    },
    {
      key: 'email',
      label: intl
        .formatMessage({ id: 'MembersPage.columnLabel.email' })
        .toUpperCase(),
      render: ({ email }, _, collapseRowController) => {
        return (
          <div className={css.columnContainer}>
            <div className={css.cellValue}>
              <span>{email}</span>
            </div>
            <div className={css.iconArrow}>
              <IconArrow
                direction="down"
                onClick={collapseRowController?.toggle}
                className={classNames(
                  css.iconArrow,
                  collapseRowController?.value && css.rotate,
                )}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const columnsControl: TColumn[] = [
    {
      key: 'group',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.group' }),
      render: (data: any, _, collapseRowController) => {
        const { colKey } = collapseRowController ?? {};

        return colKey && colKey === 'name' ? (
          <div className={css.cellLabelValue}>
            <span>
              {intl.formatMessage({ id: 'MembersPage.columnLabel.group' })}
            </span>
          </div>
        ) : (
          <div className={css.cellValue}>
            <span>{data.group}</span>
          </div>
        );
      },
    },
    {
      key: 'allergy',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.allergy' }),
      render: (data: any, _, collapseRowController) => {
        const { colKey } = collapseRowController ?? {};

        return colKey && colKey === 'name' ? (
          <div className={css.cellLabelValue}>
            <span>
              {intl.formatMessage({ id: 'MembersPage.columnLabel.allergy' })}
            </span>
          </div>
        ) : (
          <div className={css.cellValue}>
            <span className={css.cellValue}>{data.allergy}</span>
          </div>
        );
      },
    },
    {
      key: 'nutrition',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.nutrition' }),
      render: (data: any, _, collapseRowController) => {
        const { colKey } = collapseRowController ?? {};

        return colKey && colKey === 'name' ? (
          <div className={css.cellLabelValue}>
            <span>
              {intl.formatMessage({ id: 'MembersPage.columnLabel.nutrition' })}
            </span>
          </div>
        ) : (
          <div className={css.cellValue}>
            <span className={css.cellValue}>{data.nutrition}</span>
          </div>
        );
      },
    },
  ];

  const formattedCompanyMembers = useMemo<TRowData[]>(
    () =>
      mergedCompanyMembers.reduce((result: any, member: any) => {
        const id = member?.id?.uuid;
        const email = member?.attributes?.email;
        const memberGroupIds = groupList.reduce(
          (groupIds: string[], curr: TObject) => {
            const { members = [], id: groupId } = curr || {};
            const memberResult = members.find(
              ({
                id: memberIdFromGroup,
                email: memberEmailFromGroup,
              }: TObject) => {
                return (
                  memberIdFromGroup === id || memberEmailFromGroup === email
                );
              },
            );

            if (typeof memberResult !== 'undefined') {
              return [...groupIds, groupId];
            }

            return groupIds;
          },
          [],
        );

        const name = `${member.attributes.profile?.lastName || ''} ${
          member.attributes.profile?.firstName || ''
        }`;

        const allergyValue =
          User(member)
            .getPublicData()
            ?.allergies?.map((allergy: string) =>
              getLabelByKey(ALLERGIES_OPTIONS, allergy),
            )
            .join(', ') || [];
        const nutritionValue =
          User(member)
            .getPublicData()
            ?.nutritions?.map((nutrition: string) =>
              getLabelByKey(nutritions, nutrition),
            )
            ?.join(', ') || [];

        return [
          ...result,
          {
            key: id || email,
            data: {
              id,
              name,
              email,
              isParent: true,
              group: getGroupNames(memberGroupIds, groupList),
              allergy: allergyValue,
              nutrition: nutritionValue,
            },
          },
        ];
      }, []),
    [
      JSON.stringify(groupList),
      JSON.stringify(mergedCompanyMembers),
      JSON.stringify(nutritions),
    ],
  );

  useEffect(() => {
    const currentUserCompany = getCompanyIdFromBookerUser(currentUser!);
    const fetchData = async () => {
      dispatch(companyMemberActions.resetError());
      dispatch(
        addWorkspaceCompanyId(
          companyId === 'personal' ? currentUserCompany ?? '' : companyId,
        ),
      );
      await dispatch(companyThunks.companyInfo());
    };
    if (companyId) fetchData();
  }, [companyId, currentUser]);

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

  return (
    <>
      <div className={css.container}>
        <table className={css.tableContainer}>
          <thead>
            <tr className={css.headRow}>
              {columns.map((col: TColumn) => (
                <td className={css.headCell} key={col.key}>
                  <span>{col.label}</span>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {fetchCompanyInfoInProgress ? (
              <tr>
                <td colSpan={columns.length} className={css.emptyCell}>
                  Loading...
                </td>
              </tr>
            ) : formattedCompanyMembers.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={css.emptyCell}>
                  <FormattedMessage id="Table.noResults" />
                </td>
              </tr>
            ) : (
              formattedCompanyMembers.map((row: TRowData) => {
                return (
                  <CompanyCollapsibleRows
                    key={row.key}
                    bookerMemberEmails={bookerMemberEmails}
                    onDeleteMember={onDeleteMember}
                    row={row}
                    columns={columns}
                    columnsControl={columnsControl}
                  />
                );
              })
            )}
            <tr>
              <td colSpan={columns.length} className={css.bodyRowAddNewMembers}>
                <Button
                  variant="inline"
                  type="button"
                  size="large"
                  onClick={handleOpenNewMembersModal}
                  className={css.btnPlusMember}>
                  <IconPlusBlackFill className={css.iconPlus} />
                  <FormattedMessage id="AddNewMembersModal.modalTitle" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AddCompanyMembersSlideModal
        isOpen={addNewMembersController.value}
        onClose={handleCloseNewMembersModal}></AddCompanyMembersSlideModal>

      <ConfirmationModal
        isPopup={true}
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
          id: 'ManageCompanyMembersTable.memberRemoveTitle',
        })}
        description={intl.formatMessage({
          id: 'ManageCompanyMembersTable.confirmDeleteMember',
        })}
        isConfirmButtonLoading={deleteMemberInProgress}
        onConfirm={handleConfirmDeleteMember}
        onCancel={onDeleteMemberConfirmationModalClose}
        hasError={deleteMemberError}
      />
    </>
  );
};

export default CompanyMembersListMobile;
