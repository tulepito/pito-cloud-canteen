import { useEffect, useRef, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import { AvatarLarge } from '@components/Avatar/Avatar';
import Form from '@components/Form/Form';
import Icons from '@components/Icons/Icons';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TImageActionPayload } from '@redux/slices/uploadImage.slice';
import { uploadImageThunks } from '@redux/slices/uploadImage.slice';
import { User } from '@src/utils/data';
import { isUploadImageOverLimitError } from '@src/utils/errors';
import type { TCurrentUser, TUser } from '@src/utils/types';

import { AccountThunks } from '../../Account.slice';

import css from './AvatarForm.module.scss';

export type TAvatarFormValues = {};

const ACCEPT_IMAGES = 'image/*';
type TExtraProps = {
  currentUser: TCurrentUser | TUser;
};
type TAvatarFormComponentProps = FormRenderProps<TAvatarFormValues> &
  Partial<TExtraProps>;
type TAvatarFormProps = FormProps<TAvatarFormValues> & TExtraProps;

const AvatarFormComponent: React.FC<TAvatarFormComponentProps> = (props) => {
  const { handleSubmit, currentUser } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [uploadDelay, setUploadDelay] = useState(false);
  const uploadTimeoutRef = useRef<any>(null);
  const image = useAppSelector(
    (state) => state.uploadImage.image,
    shallowEqual,
  );

  const fileUploadInProgress = useAppSelector(
    (state) => state.uploadImage.uploadImageInProgress,
  );

  const uploadingOverlay =
    !image?.imageId || uploadDelay ? (
      <div className={css.thumbnailLoading}>
        <IconSpinner />
      </div>
    ) : null;

  useEffect(() => {
    if (!fileUploadInProgress) {
      setUploadDelay(true);
      uploadTimeoutRef.current = setTimeout(() => {
        setUploadDelay(false);
      }, 2000);
    }

    return () => {
      clearTimeout(uploadTimeoutRef.current);
    };
  }, [fileUploadInProgress]);
  const currentUserGetter = User(currentUser as TUser);
  const profileImageId = currentUserGetter.getProfileImage()?.id;

  const profileImage = image || { imageId: profileImageId };
  const fileExists = !!profileImage.file;
  const delayAfterUpload = uploadDelay && profileImage.imageId;

  const transientUserProfileImage =
    profileImage.uploadedImage || currentUserGetter.getProfileImage();
  const transientUser = {
    ...currentUser,
    profileImage: transientUserProfileImage,
  } as TCurrentUser;

  const imageFromFile =
    fileExists && (fileUploadInProgress || delayAfterUpload) ? (
      <ImageFromFile
        id={profileImage.id}
        rootClassName={css.uploadingImage}
        aspectRatioClassName={css.squareAspectRatio}
        file={profileImage.file}>
        {uploadingOverlay}
      </ImageFromFile>
    ) : null;

  const avatarClasses = classNames(css.avatarImg, {
    [css.avatarInvisible]: uploadDelay,
  });
  const avatarComponent =
    !fileUploadInProgress && profileImage.imageId ? (
      <AvatarLarge
        className={avatarClasses}
        user={transientUser}
        disableProfileLink
      />
    ) : null;

  const chooseAvatarLabel =
    profileImage?.imageId || fileUploadInProgress ? (
      <div className={css.avatarContainer}>
        {imageFromFile}
        {avatarComponent}
        <div className={css.camera}>
          <Icons.Camera />
        </div>
      </div>
    ) : (
      <div className={css.avatarPlaceholder}>
        <div className={css.textLabel}>
          {currentUserGetter.getProfile().abbreviatedName}
        </div>
        <div className={css.camera}>
          <Icons.Camera />
        </div>
      </div>
    );

  const onImageUpload = async ({ id, file }: TImageActionPayload) => {
    const { payload } = (await dispatch(
      uploadImageThunks.uploadImage({ id, file }),
    )) as any;
    await dispatch(
      AccountThunks.updateProfileImage(payload?.uploadedImage.id.uuid),
    );
  };

  return (
    <Form onSubmit={handleSubmit} className={css.container}>
      <div className={css.avatar}>
        <Field
          id="avatar"
          name="avatar"
          accept={ACCEPT_IMAGES}
          form={null}
          label={chooseAvatarLabel}
          disabled={fileUploadInProgress}
          type="file">
          {(fieldProps: any) => {
            const { accept, id, input, label, disabled, uploadImageError } =
              fieldProps;
            const { name, type } = input;

            const onChange = async (e: any) => {
              const file = e.target.files[0];
              if (file != null) {
                const tempId = `${file.name}_${Date.now()}`;
                await onImageUpload({ id: tempId, file });
              }
            };

            let error = null;

            if (isUploadImageOverLimitError(uploadImageError)) {
              error = (
                <div className={css.error}>
                  {intl.formatMessage({
                    id: 'ContactPointProfileForm.limitSize',
                  })}
                </div>
              );
            } else if (uploadImageError) {
              error = (
                <div className={css.error}>
                  {intl.formatMessage({
                    id: 'ContactPointProfileForm.uploadImageError',
                  })}
                </div>
              );
            }

            return (
              <div>
                <label htmlFor={id}>{label}</label>
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
      <div className={css.userName}>
        {`${currentUserGetter.getProfile().lastName} ${
          currentUserGetter.getProfile().firstName
        }`}
      </div>
    </Form>
  );
};

const AvatarForm: React.FC<TAvatarFormProps> = (props) => {
  return <FinalForm {...props} component={AvatarFormComponent} />;
};

export default AvatarForm;
