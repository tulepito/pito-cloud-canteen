import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
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
              isMobileLayout ? 'Nhập email' : 'Nhập email để thêm thành viên'
            }
            onKeyPress={handleFieldEmailsKeyPress}
            validate={composeValidators(
              emailListFormatValid('Vui lòng nhập đúng định dạng mail'),
              emailListValid(
                'Đã tồn tại trong danh sách thành viên',
                restrictEmailList,
              ),
            )}
          />
        </div>
        <Button inProgress={submitInProgress} disabled={submitDisable}>
          Thêm
        </Button>
      </div>
      <div className={css.hintText}>
        *Email được phân cách bằng khoảng trắng.
        {!isMobileLayout && ' Ví dụ: a1@gmail.comb2@gmail.com'}
      </div>

      <div className={css.hintContainer}>
        <IconLightBulb className={css.mobileLightIcon} />
        <div>
          Bạn có thể thêm hàng loạt email bằng cách copy danh sách email và dán
          vào ô nhập email.
        </div>
      </div>
    </Form>
  );
};

const AddParticipantForm: React.FC<TAddParticipantFormProps> = (props) => {
  return <FinalForm {...props} component={AddParticipantFormComponent} />;
};

export default AddParticipantForm;
