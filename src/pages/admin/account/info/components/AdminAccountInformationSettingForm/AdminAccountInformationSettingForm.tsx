import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { isEqual } from 'lodash';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldAvatar from '@components/FieldAvatar/FieldAvatar';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TImageActionPayload } from '@redux/slices/uploadImage.slice';
import { uploadImageThunks } from '@redux/slices/uploadImage.slice';
import { EImageVariants } from '@src/utils/enums';
import type { TCurrentUser } from '@src/utils/types';
import { phoneNumberFormatValid, required } from '@src/utils/validators';

import css from './AdminAccountInformationSettingForm.module.scss';

export type TAdminAccountInformationSettingFormValues = {
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: any;
  submitError: any;
};

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';

export const AVATAR_VARIANTS = [EImageVariants.default];

type TExtraProps = {
  currentUser: TCurrentUser | null;
  inProgress: boolean;
  updateError: any;
  submittedValues: TAdminAccountInformationSettingFormValues;
};
type TAdminAccountInformationSettingFormComponentProps =
  FormRenderProps<TAdminAccountInformationSettingFormValues> &
    Partial<TExtraProps>;
type TAdminAccountInformationSettingFormProps =
  FormProps<TAdminAccountInformationSettingFormValues> & TExtraProps;

const AdminAccountInformationSettingFormComponent: React.FC<
  TAdminAccountInformationSettingFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    inProgress,
    updateError,
    invalid,
    values,
    submittedValues,
  } = props;
  const dispatch = useAppDispatch();
  const onImageUpload = (e: TImageActionPayload) =>
    dispatch(uploadImageThunks.uploadImage(e));
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const submitted = isEqual(values, submittedValues);
  const buttonDisabled = invalid || inProgress;

  return (
    <Form onSubmit={handleSubmit}>
      <>
        <div className={css.fieldWrapper}>
          <FieldAvatar
            accept={ACCEPT_IMAGES}
            name="profileImage"
            id="profileImage"
            onImageUpload={onImageUpload}
            currentUser={currentUser}
          />
          <div className={css.fields}>
            <FieldTextInput
              name="name"
              id="name"
              label="Tên"
              placeholder="Nhập tên"
              validate={required('Vui lòng nhập tên')}
              className={css.field}
            />
            <FieldTextInput
              name="email"
              id="email"
              label="Email"
              placeholder="Nhập email"
              className={css.field}
              disabled
            />
            <FieldTextInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              className={css.field}
              id="phoneNumber"
              name="phoneNumber"
              validate={phoneNumberFormatValid('Số điện thoại không hợp lệ')}
            />
          </div>
        </div>
        {updateError && <ErrorMessage message="Cập nhật không thành công" />}
        <Button
          disabled={buttonDisabled}
          inProgress={inProgress}
          ready={submitted}
          className={css.button}>
          Lưu thay đổi
        </Button>
      </>
    </Form>
  );
};

const AdminAccountInformationSettingForm: React.FC<
  TAdminAccountInformationSettingFormProps
> = (props) => {
  return (
    <FinalForm
      {...props}
      component={AdminAccountInformationSettingFormComponent}
    />
  );
};

export default AdminAccountInformationSettingForm;
