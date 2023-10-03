import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import difference from 'lodash/difference';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconUpdate from '@components/Icons/IconUpdate/IconUpdate';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';
import { User } from '@src/utils/data';
import type { TCurrentUser, TUser } from '@src/utils/types';
import { emailFormatValid } from '@src/utils/validators';

import css from './InviteMemberForm.module.scss';

export type TInviteMemberFormValues = {
  emailList: string;
};

type TExtraProps = {
  selectedCompany: TUser;
  currentUser: TCurrentUser | null;
  emailList: string[];
  setEmailList: (value: string[]) => void;
  checkEmailList: (value: string[]) => void;
  loadedResult: any[];
  openMemberModal: () => void;
};
type TInviteMemberFormComponentProps =
  FormRenderProps<TInviteMemberFormValues> & Partial<TExtraProps>;
type TInviteMemberFormProps = FormProps<TInviteMemberFormValues> & TExtraProps;

const InviteMemberFormComponent: React.FC<TInviteMemberFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    form,
    selectedCompany,
    currentUser,
    emailList,
    setEmailList,
    checkEmailList,
    loadedResult = [],
    openMemberModal,
  } = props;
  const intl = useIntl();
  const invalidEmailControl = useBoolean();

  const companyUser = User(selectedCompany!);
  const currentUserGetter = User(currentUser!);
  const { members: originCompanyMembers = {} } = companyUser.getMetadata();
  const { email: companyEmail } = companyUser.getAttributes();
  const { email: currentUserEmail } = currentUserGetter.getAttributes();

  const restrictEmailList = [
    ...Object.keys(originCompanyMembers),
    companyEmail,
    currentUserEmail,
  ];

  const emailInvalidMessage = intl.formatMessage({
    id: 'AddCompanyMembersForm.emailInvalid',
  });

  const handleEmailFieldBlur = (event: any) => {
    const { value } = event.target;
    if (!value) {
      return;
    }
    const rawEmailListValue = value
      .trim()
      .split(' ')
      .map((email: string) => email.trim());
    const emailListValue = difference(rawEmailListValue, restrictEmailList);
    let invalidEmail = false;
    emailListValue.forEach((email: string) => {
      if (emailFormatValid(emailInvalidMessage)(email)) {
        invalidEmailControl.setTrue();
        invalidEmail = true;
      }
    });
    if (invalidEmail) {
      return;
    }
    invalidEmailControl.setFalse();

    // setLoadingRow(emailListValue.length);
    const formatListEmailValue = emailListValue.reduce(
      (result: string[], separatedEmail: string) => {
        const isEmailInValid = emailFormatValid(emailInvalidMessage)(
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
    setEmailList?.(newEmailList);
    form.change('emailList', '');
    checkEmailList?.(difference(Array.from(formatListEmailValue), emailList!));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter' && form.getState().valid) {
      return handleEmailFieldBlur(e);
    }
  };

  // To prevent form submit when user press enter key
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FieldTextInput
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        className={css.emailField}
        id="emailList"
        name="emailList"
        placeholder={intl.formatMessage({
          id: 'AddCompanyMembersForm.emailPlaceholder',
        })}
        label="Nhập email thành viên"
      />

      <RenderWhen condition={loadedResult?.length > 0}>
        <div className={css.openMemberModalBtn} onClick={openMemberModal}>
          Xem danh sách thành viên
        </div>
        <RenderWhen.False>
          <>
            <div className={css.tipWrapper}>
              <IconUpdate />
              <div className={css.tipContentWrapper}>
                <div className={css.title}>MẸO NHỎ</div>
                <div className={css.content}>
                  Chỉ cần copy danh sách email thành viên và dán vào ô nhập
                  email.
                </div>
              </div>
            </div>

            <div className={css.noteTip}>
              *Bạn có thể mời thành viên tham gia sau
            </div>
          </>
        </RenderWhen.False>
      </RenderWhen>
    </Form>
  );
};

const InviteMemberForm: React.FC<TInviteMemberFormProps> = (props) => {
  return <FinalForm {...props} component={InviteMemberFormComponent} />;
};

export default InviteMemberForm;
