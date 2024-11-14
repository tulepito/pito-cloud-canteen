import { useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import difference from 'lodash/difference';

import Avatar from '@components/Avatar/Avatar';
import IconClose from '@components/Icons/IconClose/IconClose';
import PopupModal from '@components/PopupModal/PopupModal';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useAddMemberEmail } from '@pages/company/[companyId]/members/hooks/useAddMemberEmail';
import { User } from '@src/utils/data';
import { QuizStep } from '@src/utils/enums';
import { emailFormatValid } from '@src/utils/validators';

import QuizModal from '../components/QuizModal/QuizModal';
import QuizCreateOrderLoadingModal from '../create-order-loading/QuizCreateOrderLoadingModal';
import { useQuizFlow } from '../hooks/useQuizFlow';

import InviteMemberForm from './InviteMemberForm/InviteMemberForm';

import css from './QuizInviteMember.module.scss';

const QuizInviteMember = () => {
  const intl = useIntl();
  const submittingControl = useBoolean();
  const memberEmailModalController = useBoolean();
  const [formEmailList, setFormEmailList] = useState<string>('');
  const {
    emailList,
    setEmailList,
    loadedResult,
    removeEmailValue,
    checkEmailList,
    addMembersInProgress,
    onAddMembersSubmitInQuizFlow,
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
  const companyUser = User(selectedCompany!);
  const currentUserGetter = User(currentUser!);
  const { members: originCompanyMembers = {} } = companyUser.getMetadata();
  const { email: companyEmail } = companyUser.getAttributes();
  const { email: currentUserEmail } = currentUserGetter.getAttributes();
  const quizFlowOpen = useAppSelector((state) => state.Quiz.quizFlowOpen);

  const restrictEmailList = [
    ...Object.keys(originCompanyMembers),
    companyEmail,
    currentUserEmail,
  ];

  const onFormatEmailList = (value: string) => {
    const rawEmailListValue = value
      .trim()
      .split(' ')
      .map((email: string) => email.trim());
    const emailListValue = difference(rawEmailListValue, restrictEmailList);
    let invalidEmail = false;
    emailListValue.forEach((email: string) => {
      if (emailFormatValid('email invalid')(email)) {
        invalidEmail = true;
      }
    });
    if (invalidEmail) {
      return [];
    }

    // setLoadingRow(emailListValue.length);
    const formatListEmailValue = emailListValue.reduce(
      (result: string[], separatedEmail: string) => {
        const isEmailInValid = emailFormatValid('email invalid')(
          separatedEmail.trim(),
        );

        return isEmailInValid
          ? result
          : new Set([...result, separatedEmail.trim().toLowerCase()]);
      },
      [],
    );
    const newEmailList = Array.from(
      new Set([...emailList!, ...formatListEmailValue]),
    );
    setEmailList(newEmailList);

    return newEmailList;
  };

  const onSubmit = async () => {
    const formattedEmailList = onFormatEmailList(formEmailList);
    const payload = await checkEmailList(formattedEmailList);
    await onAddMembersSubmitInQuizFlow(payload as any);
    await submitCreateOrder();
  };

  return !creatingOrderInProgress ? (
    <>
      <QuizModal
        id="QuizInviteMember"
        isOpen={quizFlowOpen}
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
            loadedResult={loadedResult}
            openMemberModal={memberEmailModalController.setTrue}
            setFormEmailList={setFormEmailList}
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
