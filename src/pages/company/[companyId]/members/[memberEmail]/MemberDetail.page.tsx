import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrow from '@components/IconArrow/IconArrow';
import { getGroupNames } from '@helpers/companyMembers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import { companyMemberThunks } from '@redux/slices/companyMember.slice';
import { ensureUser, USER } from '@utils/data';
import type { TUser } from '@utils/types';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './MemberDetail.module.scss';

type MemberDetailPageProps = {};

const MemberDetailPage: React.FC<MemberDetailPageProps> = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { companyId = '', memberEmail = '' } = router.query;

  const {
    value: isDeleteMemberConfirmationModalOpen,
    setFalse: onDeleteMemberConfirmationModalClose,
    setTrue: openDeleteMemberConfirmationModal,
  } = useBoolean();
  const originCompanyMembers = useAppSelector(
    (state) => state.company.originCompanyMembers,
    shallowEqual,
  );
  const groupList = useAppSelector(
    (state) => state.company.groupList,
    shallowEqual,
  );
  const hasFlexAccountCompanyMembers = useAppSelector(
    (state) => state.company.companyMembers,
    shallowEqual,
  );
  const deleteMemberInProgress = useAppSelector(
    (state) => state.companyMember.deleteMemberInProgress,
  );
  const deleteMemberError = useAppSelector(
    (state) => state.companyMember.deleteMemberError,
  );

  const checkMemberHasFlexAccount =
    !!originCompanyMembers[memberEmail as string]?.id;
  const companyMember = useMemo(() => {
    if (checkMemberHasFlexAccount) {
      return hasFlexAccountCompanyMembers.find(
        (_member) => _member.attributes.email === memberEmail,
      );
    }
    const initialUser = {
      attributes: {
        email: memberEmail,
      },
    } as TUser;
    return ensureUser(initialUser);
  }, [checkMemberHasFlexAccount, hasFlexAccountCompanyMembers, memberEmail]);

  const notAcceptInvitationText = ` ${intl.formatMessage({
    id: 'MemberDetailPage.notAcceptInvitation',
  })}`;

  const memberName = checkMemberHasFlexAccount
    ? USER(companyMember).getProfile()?.displayName || '---'
    : notAcceptInvitationText;
  useEffect(() => {
    const fetchData = async () => {
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(BookerManageCompany.companyInfo());
    };
    fetchData();
  }, [companyId, dispatch]);

  const handleGoBack = () => {
    router.back();
  };

  const onConfirmDeleteMember = useCallback(() => {
    dispatch(companyMemberThunks.deleteMember(memberEmail as string)).then(
      ({ error }: any) => {
        if (!error) {
          onDeleteMemberConfirmationModalClose();
          router.back();
        }
      },
    );
  }, [dispatch, memberEmail, onDeleteMemberConfirmationModalClose, router]);
  return (
    <div className={css.container}>
      <div className={css.backBtn} onClick={handleGoBack}>
        <IconArrow direction="left" />
        {intl.formatMessage({ id: 'MemberDetailPage.backButton' })}
      </div>
      <div className={css.header}>
        <div className={css.profileWrapper}>
          <Avatar disableProfileLink user={companyMember} />
          <h2>{memberName}</h2>
        </div>
        <div className={css.actionBtns}>
          <Button
            onClick={openDeleteMemberConfirmationModal}
            className={css.deleteBtn}>
            {intl.formatMessage({ id: 'MemberDetailPage.deleteMember' })}
          </Button>
        </div>
      </div>
      <div className={css.profileInfo}>
        <div className={css.row}>
          <span className={css.title}>
            {intl.formatMessage({ id: 'MemberDetailPage.email' })}
          </span>
          <span className={css.content}>{memberEmail || '-'}</span>
        </div>
        <div className={css.row}>
          <span className={css.title}>
            {intl.formatMessage({ id: 'MemberDetailPage.group' })}
          </span>
          <span className={css.content}>
            {getGroupNames(
              USER(companyMember).getMetadata()?.groups || [],
              groupList,
            )}
          </span>
        </div>
      </div>
      <div className={css.restrictionTable}>
        <div className={css.tableHeader}>
          <div className={css.headerCol}>
            {intl.formatMessage({ id: 'MemberDetailPage.allergy' })}
          </div>
          <div className={css.headerCol}>
            {intl.formatMessage({ id: 'MemberDetailPage.nutrition' })}
          </div>
        </div>
        <div className={css.tableBody}>
          <div className={css.bodyCol}>
            {USER(companyMember)
              .getPublicData()
              ?.allergies?.map((allergyItem: string) => (
                <div key={allergyItem}>{allergyItem}</div>
              ))}
          </div>
          <div className={css.bodyCol}>
            {USER(companyMember)
              .getPublicData()
              ?.nutritions?.map((nutritionItem: string) => (
                <div key={nutritionItem}>{nutritionItem}</div>
              ))}
          </div>
        </div>
      </div>
      <ConfirmationModal
        id="DeleteMemberConfirmationModal"
        isOpen={isDeleteMemberConfirmationModalOpen}
        onClose={onDeleteMemberConfirmationModalClose}
        confirmText={intl.formatMessage({
          id: 'MemberDetailPage.confirmDeleteMemberText',
        })}
        cancelText={intl.formatMessage({
          id: 'MemberDetailPage.cancelDeleteMemberText',
        })}
        title={intl.formatMessage({
          id: 'MemberDetailPage.deleteMemberModalTitle',
        })}
        isConfirmButtonLoading={deleteMemberInProgress}
        onConfirm={onConfirmDeleteMember}
        onCancel={onDeleteMemberConfirmationModalClose}
        hasError={deleteMemberError}
      />
    </div>
  );
};

export default MemberDetailPage;
