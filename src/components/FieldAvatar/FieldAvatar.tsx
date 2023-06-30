/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useRef, useState } from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import IconCamera from '@components/Icons/IconCamera/IconCamera';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import { ensureCurrentUser } from '@src/utils/data';
import { isUploadImageOverLimitError } from '@src/utils/errors';
import type { TCurrentUser, TObject } from '@src/utils/types';

import css from './FieldAvatar.module.scss';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset

type TFieldAvatar = {
  accept: any;
  name: string;
  id: string;
  currentUser: TCurrentUser | null;
  onImageUpload: (e: any) => any;
};

const FieldAvatar: React.FC<TFieldAvatar> = (props) => {
  const {
    accept = ACCEPT_IMAGES,
    name,
    id,
    currentUser,
    onImageUpload,
  } = props;

  const [uploadDelay, setUploadDelay] = useState<boolean>(false);
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  const [uploadImageError, setUploadImageError] = useState<TObject>();
  const uploadDelayTimeoutId = useRef<any>();

  useEffect(() => {
    if (!uploadInProgress) {
      setUploadDelay(true);
      uploadDelayTimeoutId.current = window.setTimeout(() => {
        setUploadDelay(false);
      }, UPLOAD_CHANGE_DELAY);
    }

    return () => {
      window.clearTimeout(uploadDelayTimeoutId.current);
    };
  }, [uploadInProgress]);

  return (
    <Field
      accept={accept}
      id={id}
      name={name}
      type="file"
      form={null}
      uploadImageError={uploadImageError}
      disabled={uploadInProgress}>
      {(fieldProps) => {
        const { accept, id, input, disabled, uploadImageError } = fieldProps;
        const { name, type, value: profileImage = {} } = input;

        const user = ensureCurrentUser(currentUser);

        const uploadingOverlay =
          uploadInProgress || uploadDelay ? (
            <div className={css.uploadingImageOverlay}>
              <IconSpinner className={css.iconSpinner} />
            </div>
          ) : null;

        const hasUploadError = !!uploadImageError && !uploadInProgress;
        const errorClasses = classNames({
          [css.avatarUploadError]: hasUploadError,
        });
        const transientUserProfileImage =
          profileImage.uploadedImage || user.profileImage;
        const transientUser = {
          ...user,
          profileImage: transientUserProfileImage,
        };

        // Ensure that file exists if imageFromFile is used
        const fileExists = !!profileImage.file;
        const fileUploadInProgress = uploadInProgress && fileExists;
        const delayAfterUpload = profileImage.imageId && uploadDelay;
        const imageFromFile =
          fileExists && (fileUploadInProgress || delayAfterUpload) ? (
            <ImageFromFile
              id={profileImage.id}
              className={errorClasses}
              rootClassName={css.uploadingImage}
              file={profileImage.file}>
              {uploadingOverlay}
            </ImageFromFile>
          ) : null;

        // Avatar is rendered in hidden during the upload delay
        // Upload delay smoothes image change process:
        // responsive img has time to load srcset stuff before it is shown to user.
        const avatarClasses = classNames(errorClasses, css.avatar, {
          [css.avatarInvisible]: uploadDelay,
        });
        const avatarComponent =
          !fileUploadInProgress && profileImage.imageId ? (
            <div className={css.uploadedAvatarWrapper}>
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUser}
                disableProfileLink
              />
              <div className={css.changeAvatar}>
                <IconCamera />
              </div>
            </div>
          ) : null;

        const chooseAvatarLabel =
          profileImage.imageId || fileUploadInProgress ? (
            <div className={css.avatarContainer}>
              {imageFromFile}
              {avatarComponent}
            </div>
          ) : (
            <div className={css.avatarPlaceholder}>
              <div className={css.avatarPlaceholderText}>
                <FormattedMessage id="FieldAvatar.addYourProfilePicture" />
              </div>
              <div className={css.avatarPlaceholderTextMobile}>
                <FormattedMessage id="FieldAvatar.addYourProfilePictureMobile" />
              </div>
            </div>
          );

        const onChange = async (e: any) => {
          setUploadInProgress(true);
          const file = e.target.files[0];
          if (file != null) {
            const tempId = `${file.name}_${Date.now()}`;
            input.onChange({ id: tempId, file });
            const { payload, error } = await onImageUpload({
              id: tempId,
              file,
            });
            if (!error) {
              input.onChange({
                uploadedImage: payload.uploadedImage,
                imageId: payload.uploadedImage.id,
              });
            }
            setUploadImageError(error);
          }
          setUploadInProgress(false);
        };

        let error = null;

        if (isUploadImageOverLimitError(uploadImageError)) {
          error = (
            <div className={css.error}>
              <FormattedMessage id="FieldAvatar.imageUploadFailedFileTooLarge" />
            </div>
          );
        } else if (uploadImageError) {
          error = (
            <div className={css.error}>
              <FormattedMessage id="FieldAvatar.imageUploadFailed" />
            </div>
          );
        }

        return (
          <div className={css.uploadAvatarWrapper}>
            <label className={css.label} htmlFor={id}>
              {chooseAvatarLabel}
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
  );
};

export default FieldAvatar;
