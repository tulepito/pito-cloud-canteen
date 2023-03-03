import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TImageActionPayload } from '@redux/slices/uploadImage.slice';
import { uploadImageThunks } from '@redux/slices/uploadImage.slice';
import { EImageVariants } from '@utils/enums';

import css from './UploadImageForm.module.scss';

export type TUploadImageFormValues = {
  companyImage: File;
};

const ACCEPT_IMAGES = 'image/*';
const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // MB
type TExtraProps = {};
type TUploadImageFormComponentProps = FormRenderProps<TUploadImageFormValues> &
  Partial<TExtraProps>;
type TUploadImageFormProps = FormProps<TUploadImageFormValues> & TExtraProps;

const UploadImageFormComponent: React.FC<TUploadImageFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [isLimitSize, setIsLimitSize] = useState<boolean>(false);

  const fileImageUploadInProgress = useAppSelector(
    (state) => state.uploadImage.uploadImageInProgress,
  );
  const fileImageUploadError = useAppSelector(
    (state) => state.uploadImage.uploadImageError,
  );
  const uploadedImage = useAppSelector(
    (state) => state.uploadImage.image,
    shallowEqual,
  );
  const companyAccount = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );

  const updateCompanyInProgress = useAppSelector(
    (state) => state.company.updateCompanyInProgress,
  );
  const companyLogoImageId = companyAccount?.profileImage?.id;
  const companyLogoImage = uploadedImage || { imageId: companyLogoImageId };
  const transientCompanyLogoImage =
    companyLogoImage.uploadedImage || companyAccount?.profileImage;
  const uploadingOverlay = !uploadedImage?.imageId ? (
    <div className={css.thumbnailLoading}>
      <IconSpinner />
    </div>
  ) : null;
  const fileExists = !!companyLogoImage.file;
  const imageFromFile =
    fileExists && fileImageUploadInProgress ? (
      <ImageFromFile
        id={companyLogoImage.id}
        rootClassName={css.uploadingImage}
        aspectRatioClassName={css.squareAspectRatio}
        file={companyLogoImage.file}>
        {uploadingOverlay}
      </ImageFromFile>
    ) : null;
  const reponsiveImage =
    !fileImageUploadInProgress && companyLogoImage?.imageId ? (
      <ResponsiveImage
        alt={'a'}
        image={transientCompanyLogoImage}
        variants={[EImageVariants.scaledLarge, EImageVariants.default]}
      />
    ) : null;

  const companyImageLabel =
    companyLogoImage?.imageId || fileImageUploadInProgress ? (
      <>
        {imageFromFile}
        {reponsiveImage}
      </>
    ) : (
      <>
        <div className={css.imageLabelWrapper}>
          <div className={css.selectImageBtn}>
            {intl.formatMessage({ id: 'UploadImageForm.selectImage' })}
          </div>
          <div className={css.imageDescription}>
            {intl.formatMessage({ id: 'UploadImageForm.imageDescription' })}
          </div>
        </div>
      </>
    );

  const onImageUpload = async ({ id, file }: TImageActionPayload) => {
    await dispatch(uploadImageThunks.uploadImage({ id, file }));
  };
  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <Field
          accept={ACCEPT_IMAGES}
          id="companyImage"
          name="companyImage"
          label={companyImageLabel}
          type="file"
          form={null}
          uploadImageError={fileImageUploadError}
          disabled={fileImageUploadInProgress}>
          {(fieldProps) => {
            const { accept, id, input, label, disabled, uploadImageError } =
              fieldProps;
            const { name, type } = input;
            const onChange = async (e: any) => {
              const file = e.target.files[0];
              form.change(`companyImage`, file);
              form.blur(`companyImage`);
              if (file != null) {
                if (file.size >= IMAGE_MAX_SIZE) {
                  setIsLimitSize(true);
                  return;
                }
                setIsLimitSize(false);
                const tempId = `${file.name}_${Date.now()}`;
                await onImageUpload({ id: tempId, file });
              }
            };

            let error = null;

            if (isLimitSize) {
              error = (
                <div className={css.error}>
                  {intl.formatMessage({ id: 'UploadImageForm.limitImage' })}
                </div>
              );
            } else if (uploadImageError) {
              error = (
                <div className={css.error}>
                  {intl.formatMessage({
                    id: 'UploadImageForm.uploadImageError',
                  })}
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
                  className={css.uploadImageInput}
                  disabled={disabled}
                  onChange={onChange}
                  type={type}
                />
                {error}
              </div>
            );
          }}
        </Field>

        <Button
          type="submit"
          className={css.submitBtn}
          inProgress={updateCompanyInProgress}>
          {intl.formatMessage({ id: 'UploadImageForm.submit' })}
        </Button>
      </div>
    </Form>
  );
};

const UploadImageForm: React.FC<TUploadImageFormProps> = (props) => {
  return <FinalForm {...props} component={UploadImageFormComponent} />;
};

export default UploadImageForm;
