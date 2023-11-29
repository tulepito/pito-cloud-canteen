import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { getGroupNames, getMemberById } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  addWorkspaceCompanyId,
  companyThunks,
} from '@redux/slices/company.slice';
import { companyMemberThunks } from '@redux/slices/companyMember.slice';
import { ALLERGIES_OPTIONS, getLabelByKey } from '@src/utils/options';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import css from './GroupMemberDetail.module.scss';

type GroupMemberDetailPageProps = {};

const GroupMemberDetailPage: React.FC<GroupMemberDetailPageProps> = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { companyId = '', memberId = '' } = router.query;

  const {
    value: isDeleteMemberConfirmationModalOpen,
    setFalse: onDeleteMemberConfirmationModalClose,
    setTrue: openDeleteMemberConfirmationModal,
  } = useBoolean();
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
  const nutritions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );
  const companyMember = getMemberById(
    memberId as string,
    hasFlexAccountCompanyMembers,
  );

  const memberName =
    User(companyMember as TUser).getProfile()?.displayName || '---';

  const memberEmail = User(companyMember as TUser).getAttributes().email;

  useEffect(() => {
    const fetchData = async () => {
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(companyThunks.companyInfo());
    };
    if (companyId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleGoBack = () => {
    router.back();
  };

  const onConfirmDeleteMember = useCallback(() => {
    dispatch(
      companyMemberThunks.deleteMember(
        User(companyMember!).getAttributes().email,
      ),
    ).then(({ error }: any) => {
      if (!error) {
        onDeleteMemberConfirmationModalClose();
        router.back();
      }
    });
  }, [dispatch, companyMember, onDeleteMemberConfirmationModalClose, router]);

  return (
    <div className={css.container}>
      <div className={css.backBtn} onClick={handleGoBack}>
        <IconArrow direction="left" />
        {intl.formatMessage({ id: 'GroupMemberDetailPage.backButton' })}
      </div>
      <div className={css.header}>
        <div className={css.profileWrapper}>
          <Avatar
            className={css.avatar}
            disableProfileLink
            user={companyMember!}
          />
          <h2 className={css.name}>{memberName}</h2>
        </div>
        <div className={css.actionBtns}>
          <Button
            onClick={openDeleteMemberConfirmationModal}
            className={css.deleteBtn}>
            {intl.formatMessage({ id: 'GroupMemberDetailPage.deleteMember' })}
          </Button>
        </div>
      </div>
      <div className={css.profileInfo}>
        <div className={css.row}>
          <span className={css.title}>
            {intl.formatMessage({ id: 'GroupMemberDetailPage.email' })}
          </span>
          <span className={css.content}>{memberEmail || '-'}</span>
        </div>
        <div className={css.row}>
          <span className={css.title}>
            {intl.formatMessage({ id: 'GroupMemberDetailPage.group' })}
          </span>
          <span className={css.content}>
            {getGroupNames(
              User(companyMember!).getMetadata().groupList || [],
              groupList,
            )}
          </span>
        </div>
      </div>
      <div className={css.restrictionTable}>
        <div className={css.tableHeader}>
          <div className={css.headerCol}>
            {intl.formatMessage({ id: 'GroupMemberDetailPage.allergy' })}
          </div>
          <div className={css.headerCol}>
            {intl.formatMessage({ id: 'GroupMemberDetailPage.nutrition' })}
          </div>
        </div>
        <div className={css.tableBody}>
          <div className={css.bodyCol}>
            {User(companyMember!)
              .getPublicData()
              ?.allergies?.map((allergyItem: string) => (
                <div key={allergyItem}>
                  {getLabelByKey(ALLERGIES_OPTIONS, allergyItem)}
                </div>
              ))}
          </div>
          <div className={css.bodyCol}>
            {User(companyMember!)
              .getPublicData()
              ?.nutritions?.map((nutritionItem: string) => (
                <div key={nutritionItem}>
                  {getLabelByKey(nutritions, nutritionItem)}
                </div>
              ))}
          </div>
        </div>
      </div>
      <ConfirmationModal
        id="DeleteMemberConfirmationModal"
        isOpen={isDeleteMemberConfirmationModalOpen}
        onClose={onDeleteMemberConfirmationModalClose}
        confirmText={intl.formatMessage({
          id: 'GroupMemberDetailPage.confirmDeleteMemberText',
        })}
        cancelText={intl.formatMessage({
          id: 'GroupMemberDetailPage.cancelDeleteMemberText',
        })}
        title={intl.formatMessage({
          id: 'GroupMemberDetailPage.deleteMemberModalTitle',
        })}
        isConfirmButtonLoading={deleteMemberInProgress}
        onConfirm={onConfirmDeleteMember}
        onCancel={onDeleteMemberConfirmationModalClose}
        hasError={deleteMemberError}
      />
    </div>
  );
};

export default GroupMemberDetailPage;
