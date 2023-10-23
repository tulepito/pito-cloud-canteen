/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconUpdate from '@components/Icons/IconUpdate/IconUpdate';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './InviteMemberForm.module.scss';

export type TInviteMemberFormValues = {
  emailList: string;
};

type TExtraProps = {
  loadedResult: any[];
  openMemberModal: () => void;
  setFormEmailList: (value: string) => void;
};
type TInviteMemberFormComponentProps =
  FormRenderProps<TInviteMemberFormValues> & Partial<TExtraProps>;
type TInviteMemberFormProps = FormProps<TInviteMemberFormValues> & TExtraProps;

const InviteMemberFormComponent: React.FC<TInviteMemberFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    loadedResult = [],
    openMemberModal,
    values,
    setFormEmailList,
  } = props;
  const intl = useIntl();

  useEffect(() => {
    if (values.emailList) {
      setFormEmailList?.(values.emailList);
    }
  }, [values.emailList]);

  return (
    <Form onSubmit={handleSubmit}>
      <FieldTextInput
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
