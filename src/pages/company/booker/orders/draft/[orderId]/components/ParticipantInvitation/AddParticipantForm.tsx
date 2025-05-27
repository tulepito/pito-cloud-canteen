import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconLightBulb from '@components/Icons/IconLightBulb/IconLightBulb';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import {
  composeValidators,
  emailListFormatValid,
  emailListValid,
} from '@src/utils/validators';

import css from './AddParticipantForm.module.scss';

export type TAddParticipantFormValues = {
  emails: string;
};

type TExtraProps = { restrictEmailList: string[] };
type TAddParticipantFormComponentProps =
  FormRenderProps<TAddParticipantFormValues> & Partial<TExtraProps>;
type TAddParticipantFormProps = FormProps<TAddParticipantFormValues> &
  TExtraProps;

const AddParticipantFormComponent: React.FC<
  TAddParticipantFormComponentProps
> = (props) => {
  const {
    invalid,
    values,
    submitting,
    form,
    handleSubmit: handleSubmitFormProps,
    restrictEmailList = [],
  } = props;
  const { isMobileLayout } = useViewport();
  const addOrderParticipantsInProgress = useAppSelector(
    (state) => state.BookerDraftOrderPage.addOrderParticipantsInProgress,
  );
  const intl = useIntl();

  const isInputEmpty = isEmpty(values.emails);
  const submitInProgress = addOrderParticipantsInProgress || submitting;
  const submitDisable = isInputEmpty || invalid || submitting;

  const handleSubmit = async (event: any) => {
    const errors = await handleSubmitFormProps(event);

    if (isEmpty(errors?.emails)) {
      form.reset();
    }
  };

  const handleFieldEmailsKeyPress = async (event: any) => {
    if (event.key === 'Enter') {
      if (submitDisable) {
        return false;
      }
      await handleSubmit(event);
    }
  };

  return (
    <Form className={css.formRoot} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <div className={css.fieldContainer}>
          <FieldTextInput
            id="AddParticipantForm.emails"
            name="emails"
            placeholder={
              isMobileLayout
                ? intl.formatMessage({ id: 'nhap-email' })
                : intl.formatMessage({ id: 'nhap-email-de-them-thanh-vien' })
            }
            onKeyPress={handleFieldEmailsKeyPress}
            validate={composeValidators(
              emailListFormatValid(
                intl.formatMessage({ id: 'vui-long-nhap-dung-dinh-dang-mail' }),
              ),
              emailListValid(
                intl.formatMessage({
                  id: 'da-ton-tai-trong-danh-sach-thanh-vien',
                }),
                restrictEmailList,
              ),
            )}
          />
        </div>
        <Button inProgress={submitInProgress} disabled={submitDisable}>
          {intl.formatMessage({ id: 'them' })}
        </Button>
      </div>
      <div className={css.hintText}>
        *{intl.formatMessage({ id: 'email-duoc-phan-cach-bang-khoang-trang' })}.
        {!isMobileLayout && ' Ví dụ: a1@gmail.com b2@gmail.com'}
      </div>

      <div className={css.hintContainer}>
        <IconLightBulb className={css.mobileLightIcon} />
        <div>
          {intl.formatMessage({
            id: 'ban-co-the-them-hang-loat-email-bang-cach-copy-danh-sach-email-va-dan-vao-o-nhap-email',
          })}
        </div>
      </div>
    </Form>
  );
};

const AddParticipantForm: React.FC<TAddParticipantFormProps> = (props) => {
  return <FinalForm {...props} component={AddParticipantFormComponent} />;
};

export default AddParticipantForm;
