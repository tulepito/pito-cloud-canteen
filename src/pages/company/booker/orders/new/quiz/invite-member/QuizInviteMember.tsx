import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import Avatar from '@components/Avatar/Avatar';
import IconClose from '@components/Icons/IconClose/IconClose';
import PopupModal from '@components/PopupModal/PopupModal';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useAddMemberEmail } from '@pages/company/[companyId]/members/hooks/useAddMemberEmail';
import { User } from '@src/utils/data';
import { QuizStep } from '@src/utils/enums';

import QuizModal from '../components/QuizModal/QuizModal';
import QuizCreateOrderLoadingModal from '../create-order-loading/QuizCreateOrderLoadingModal';
import { useQuizFlow } from '../hooks/useQuizFlow';

import InviteMemberForm from './InviteMemberForm/InviteMemberForm';

import css from './QuizInviteMember.module.scss';

const QuizInviteMember = () => {
  const intl = useIntl();
  const submittingControl = useBoolean();
  const memberEmailModalController = useBoolean();
  const {
    emailList,
    setEmailList,
    loadedResult,
    removeEmailValue,
    checkEmailList,
    onAddMembersSubmit,
    addMembersInProgress,
  } = useAddMemberEmail();

  const {
    backStep,
    submitCreateOrder,
    creatingOrderInProgress,
    creatingOrderError,
  } = useQuizFlow(QuizStep.INVITE_MEMBER);
  const selectedCompany = useAppSelector(
    (state) => state.Quiz.selectedCompany,
    shallowEqual,
  );
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const onSubmit = async () => {
    await onAddMembersSubmit();
    await submitCreateOrder();
  };

  return !creatingOrderInProgress ? (
    <>
      <QuizModal
        id="QuizInviteMember"
        isOpen
        modalTitle={
          <div className={css.headerContainer}>
            <div className={css.main}>
              {intl.formatMessage({
                id: 'QuizInviteMember.title',
              })}
            </div>
            <div className={css.semi}>
              (Các thành viên được mời sẽ nhận thông báo chọn món ngay sau khi
              bạn tạo đơn cho công ty.)
            </div>
          </div>
        }
        submitText="Tìm nhà hàng"
        onSubmit={onSubmit}
        submitInProgress={submittingControl.value || addMembersInProgress}
        onBack={backStep}>
        <div className={css.formContainer}>
          <InviteMemberForm
            onSubmit={() => {}}
            selectedCompany={selectedCompany}
            currentUser={currentUser}
            emailList={emailList}
            setEmailList={setEmailList}
            checkEmailList={checkEmailList}
            loadedResult={loadedResult}
            openMemberModal={memberEmailModalController.setTrue}
            onAddMembersSubmit={onAddMembersSubmit}
          />
        </div>
      </QuizModal>
      <PopupModal
        id="MemberEmailModal"
        isOpen={memberEmailModalController.value}
        title="Thêm thành viên"
        containerClassName={css.memberModalContainer}
        handleClose={memberEmailModalController.setFalse}>
        <div className={css.loadedResult}>
          {loadedResult.map((record, index: number) => {
            const hasNoAccount = record.response?.status === 404;
            const recordUser = User(record.response.user);
            const { lastName, firstName } = recordUser.getProfile();
            const onDeleteUser = () => {
              removeEmailValue(record.email);
            };

            return (
              <div key={index} className={css.memberItem}>
                <div className={css.memberWrapper}>
                  {hasNoAccount ? (
                    <>
                      <div className={css.grayCircle} />
                      <div className={css.fullRowEmail}>{record.email}</div>
                    </>
                  ) : (
                    <>
                      <Avatar
                        className={css.avatar}
                        user={record.response.user}
                        disableProfileLink
                      />
                      <div>
                        <div className={css.name}>
                          {`${lastName || ''} ${firstName || ''}`}
                        </div>
                        <div className={css.email}>{record.email}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className={css.actionsWrapper}>
                  <IconClose className={css.closeIcon} onClick={onDeleteUser} />
                </div>
              </div>
            );
          })}
        </div>
      </PopupModal>
    </>
  ) : (
    <QuizCreateOrderLoadingModal creatingOrderError={creatingOrderError} />
  );
};

export default QuizInviteMember;
