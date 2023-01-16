// eslint-disable-next-line import/no-named-as-default
import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TCompanyImageActionPayload } from '@redux/slices/company.slice';
import { BookerManageCompany } from '@redux/slices/company.slice';
import { isUploadImageOverLimitError } from '@utils/errors';
import { required } from '@utils/validators';
import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { shallowEqual } from 'react-redux';

import css from './CompanySettingForm.module.scss';

const ACCEPT_IMAGES = 'image/*';

const CompanySettingForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const company = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );
  const uploadCompanyImageInProgress = useAppSelector(
    (state) => state.company.uploadCompanyImageInProgress,
  );
  const updateCompanyInProgress = useAppSelector(
    (state) => state.company.updateCompanyInProgress,
  );
  const uploadCompanyImageError = useAppSelector(
    (state) => state.company.uploadCompanyImageError,
  );
  const updateCompanyError = useAppSelector(
    (state) => state.company.updateCompanyError,
  );
  const companyName = company?.attributes?.profile?.displayName;
  const companyImage = useAppSelector(
    (state) => state.company.companyImage,
    shallowEqual,
  );
  const initialValues = useMemo(
    () => ({
      companyName,
      companyImage: company?.profileImage,
    }),
    [companyName, JSON.stringify(companyImage)],
  );

  const onImageUpload = ({ id, file }: TCompanyImageActionPayload) => {
    dispatch(BookerManageCompany.uploadCompanyImage({ id, file }));
  };
  const onSubmit = (values: any) => {
    const { companyName: companyNameValue } = values;
    dispatch(
      BookerManageCompany.updateCompanyAccount({
        companyName: companyNameValue,
      }),
    );
  };
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form, pristine, invalid } = formRenderProps;
        const submitDisabled = pristine || invalid || updateCompanyInProgress;
        const fileExists = !!companyImage?.file;
        const fileUploadInProgress = updateCompanyInProgress && fileExists;
        // const imageFromFile =
        //   fileExists && fileUploadInProgress ? (
        //     <ImageFromFile
        //       id={companyImage.id}
        //       className={errorClasses}
        //       rootClassName={css.uploadingImage}
        //       aspectRatioClassName={css.squareAspectRatio}
        //       file={companyImage.file}>
        //       {uploadingOverlay}
        //     </ImageFromFile>
        //   ) : null;

        // const avatarComponent =
        //   !fileUploadInProgress && companyImage?.imageId ? (
        //     <Avatar
        //       className={css.avatar}
        //       renderSizes="96px"
        //       user={transientUser}
        //       disableProfileLink
        //     />
        //   ) : null;
        const chooseAvatarLabel =
          companyImage?.imageId || fileUploadInProgress ? (
            <div className={css.avatarContainer}>
              {/* {imageFromFile} */}
              {/* {avatarComponent} */}
              <div className={css.changeAvatar}>Thay doi</div>
            </div>
          ) : (
            <div className={css.avatarPlaceholder}>
              <div className={css.avatarPlaceholderText}>Them logo cong ty</div>
              <div className={css.avatarPlaceholderTextMobile}>+ Them</div>
            </div>
          );

        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.sectionContainer}>
              <h3>Logo cong ty</h3>
              <Field
                accept={ACCEPT_IMAGES}
                id="companyImage"
                name="companyImage"
                label={chooseAvatarLabel}
                type="file"
                form={null}
                uploadImageError={uploadCompanyImageError}
                disabled={uploadCompanyImageInProgress}>
                {(fieldProps) => {
                  const {
                    accept,
                    id,
                    input,
                    label,
                    disabled,
                    uploadImageError,
                  } = fieldProps;
                  const { name, type } = input;
                  const onChange = (e: any) => {
                    const file = e.target.files[0];
                    form.change(`companyImage`, file);
                    form.blur(`companyImage`);
                    if (file != null) {
                      const tempId = `${file.name}_${Date.now()}`;
                      onImageUpload({ id: tempId, file });
                    }
                  };

                  let error = null;

                  if (isUploadImageOverLimitError(uploadImageError)) {
                    error = (
                      <div className={css.error}>
                        Hinh anh vuot qua dung luong roi con dy oi
                      </div>
                    );
                  } else if (uploadImageError) {
                    error = (
                      <div className={css.error}>
                        Co cai lon gi do da xay ra roi
                      </div>
                    );
                  }

                  return (
                    <div className={css.uploadAvatarWrapper}>
                      <label className={css.label} htmlFor={id}>
                        {label}
                      </label>
                      <input
                        accept={accept}
                        id={id}
                        name={name}
                        className={css.uploadAvatarInput}
                        disabled={disabled}
                        onChange={onChange}
                        type={type}
                      />
                      {error}
                    </div>
                  );
                }}
              </Field>
            </div>
            <div className={css.sectionContainer}>
              <h3 className={css.sectionTitle}>Ten cong ty</h3>
              <div className={css.nameContainer}>
                <FieldTextInput
                  className={css.firstName}
                  type="text"
                  id="companyName"
                  name="companyName"
                  label={'Ten cong ty'}
                  placeholder={'PITO'}
                  validate={required('Vui long nhap ten cong ty')}
                />
              </div>
            </div>
            {updateCompanyError}
            <Button
              className={css.submitButton}
              type="submit"
              inProgress={updateCompanyInProgress}
              disabled={submitDisabled}>
              Luu thay doi
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default CompanySettingForm;
