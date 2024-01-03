import type { ChangeEvent } from 'react';
import React, { useRef, useState } from 'react';
import { Field } from 'react-final-form';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconCamera from '@components/Icons/IconCamera/IconCamera';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { BOTTOM_CENTER_TOAST_ID } from '@components/ToastifyProvider/ToastifyProvider';
import useBoolean from '@hooks/useBoolean';
import { IS_PARTNER_PROFILE_EDITABLE } from '@pages/partner/settings/account/helpers/constants';
import { isUploadImageOverLimitError } from '@utils/errors';
import type {
  TDefaultProps,
  TImage,
  TImageVariant,
  TObject,
} from '@utils/types';

import css from './FieldPhotoUpload.module.scss';

type TPhotoWithOverlay = TDefaultProps & {
  id: string;
  image: TImage & { file: File; imageId: string };
  savedImageAltText: string;
  onRemoveImage: (id: any) => void;
  onUploadImage: () => void;
  onClick?: () => void;
  variants: TImageVariant[];
  shouldShowClearBtn?: boolean;
  shouldShowUploadBtn?: boolean;
  uploadBtnWithImgClassName?: string;
};

const PhotoWithOverlay = (props: TPhotoWithOverlay) => {
  const {
    className,
    image,
    savedImageAltText,
    onRemoveImage,
    onClick,
    variants,
    shouldShowClearBtn = true,
    shouldShowUploadBtn = false,
    uploadBtnWithImgClassName,
    onUploadImage,
  } = props;
  const handleRemoveClick = (e: any) => {
    e.stopPropagation();
    onRemoveImage(image.id);
  };

  if (image.file) {
    // While image is uploading we show overlay on top of thumbnail
    const uploadingOverlay = !image.imageId ? (
      <div className={css.thumbnailLoading}>
        <IconSpinner />
      </div>
    ) : null;

    return (
      <ImageFromFile
        id={image.id}
        className={className}
        rootClassName={css.thumbnail}
        file={image.file}>
        {uploadingOverlay}
      </ImageFromFile>
    );
  }
  const classes = classNames(css.thumbnail, className);

  const handleClick = (_e: any) => {
    if (onClick) onClick();
  };

  return (
    <div onClick={handleClick} className={css.previewImage}>
      <div className={classes}>
        <div className={css.threeToTwoWrapper}>
          <div className={css.aspectWrapper}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              image={image}
              alt={savedImageAltText}
              variants={variants}
            />
          </div>
        </div>
      </div>

      <RenderWhen condition={shouldShowClearBtn}>
        <InlineTextButton
          type="button"
          className={css.removeButton}
          onClick={handleRemoveClick}>
          <IconClose />
        </InlineTextButton>
      </RenderWhen>
      <RenderWhen condition={shouldShowUploadBtn}>
        <InlineTextButton
          type="button"
          className={classNames(
            css.iconCameraContainerWithImg,
            uploadBtnWithImgClassName,
          )}
          onClick={onUploadImage}>
          <IconCamera />
        </InlineTextButton>
      </RenderWhen>
    </div>
  );
};

export type TImageUploadFnReturnValue = {
  payload: TObject;
};

export type TFieldPhotoUpload = {
  onImageUpload: (params: {
    id: string;
    file: File;
  }) => Promise<TImageUploadFnReturnValue>;
  onRemoveImage: (id: string) => void;
  image: any;
  accept?: string;
  disabled?: boolean;
  className?: string;
  variants: string[];
  uploadImageError?: any;
  iconUploadClassName?: string;
  shouldHideIconWhenEmpty?: boolean;
  shouldShowIconCameraWhenEmpty?: boolean;
  iconCameraClassName?: string;
  shouldShowClearBtn?: boolean;
  shouldShowUploadBtnWithImg?: boolean;
  uploadBtnWithImgClassName?: string;
  name: string;
  id: string;
  validate?: any;
  filesChangeDisabledByToast?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
const FieldPhotoUpload: React.FC<TFieldPhotoUpload> = ({
  filesChangeDisabledByToast,
  ...props
}) => {
  const intl = useIntl();
  const [triggerFlag, setTriggerFlag] = useState<string>('');
  const [shouldRemoveImgId, setShouldRemoveImgId] = useState<string>('');
  const shouldRemoveImgControl = useBoolean(false);
  const inputRef = useRef(null);

  const toastPreventChangingFiles = () => {
    toast.info(
      intl.formatMessage({ id: 'AccountSettingsModal.announcement' }),
      {
        closeButton: false,
        autoClose: 5000,
        hideProgressBar: true,
        containerId: BOTTOM_CENTER_TOAST_ID,
        toastId: 'toastPreventChangingFiles',
        icon: false,
        className: css.toast,
      },
    );
  };

  const makeFnWithDisabled =
    (fn: any) =>
    (...args: any) => {
      if (filesChangeDisabledByToast && !IS_PARTNER_PROFILE_EDITABLE) {
        toastPreventChangingFiles();
      } else {
        fn(...args);
      }
    };

  return (
    <>
      <Field initialValue={props.image} {...props}>
        {(fieldRenderProps) => {
          const {
            accept,
            input,
            disabled: fieldDisabled,
            onImageUpload,
            image,
            className,
            onRemoveImage,
            variants,
            uploadImageError,
            iconUploadClassName,
            meta,
            shouldHideIconWhenEmpty = false,
            shouldShowClearBtn = true,
            iconCameraClassName,
            shouldShowIconCameraWhenEmpty = false,
            shouldShowUploadBtnWithImg = false,
            uploadBtnWithImgClassName,
          } = fieldRenderProps;

          const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
            const { files } = e.target;
            const file = files && files[0];
            if (file) {
              if (shouldRemoveImgControl.value && shouldRemoveImgId) {
                onRemoveImage(shouldRemoveImgId);
                setShouldRemoveImgId('');
                shouldRemoveImgControl.setFalse();
              }

              const params = {
                file,
                id: `${file.name}_${new Date().getTime()}`,
              };
              input.onChange(params);
              input.onBlur();
              const { payload } = await onImageUpload(params);
              input.onChange(payload);
              input.onBlur();
              // To reset input files.
              // The problem is when choose same file browser doesn't trigger on change
              setTriggerFlag(`${file.name}_${new Date().getTime()}`);
            }
          };

          const handleClickUploadImage = (oldImgId: string) => () => {
            if (inputRef.current !== null && (inputRef.current as any)?.click) {
              (inputRef.current as any).click();
              setShouldRemoveImgId(oldImgId);
              shouldRemoveImgControl.setTrue();
            }
          };

          const removeFn = (id: any) => {
            input.onChange('');
            onRemoveImage(id);
          };

          const inputProps = {
            key: triggerFlag,
            accept,
            id: input.name,
            name: input.name,
            onChange,
            type: 'file',
            ref: inputRef,
          };

          const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

          let uploadImageFailed = null;

          if (uploadOverLimit) {
            uploadImageFailed = intl.formatMessage({
              id: 'FieldPhotoUpload.imageUploadFailed.uploadOverLimit',
            });
          } else if (uploadImageError) {
            uploadImageFailed = intl.formatMessage({
              id: 'FieldPhotoUpload.imageUploadFailed.uploadFailed',
            });
          }

          const { invalid, touched, error } = meta;
          // Error message and input error styles are only shown if the
          // field has been touched and the validation has failed.

          const hasError = !!(touched && invalid && error);

          return !fieldDisabled ? (
            <>
              <div
                className={classNames(css.root, className, {
                  [css.error]: hasError,
                })}>
                {!filesChangeDisabledByToast && (
                  <input {...inputProps} className={css.addImageInput} />
                )}
                {image && !uploadImageFailed ? (
                  <PhotoWithOverlay
                    id={image.id}
                    rootClassName={css.rootForImage}
                    image={image}
                    savedImageAltText={`${input.name} asset`}
                    variants={variants}
                    onRemoveImage={makeFnWithDisabled(removeFn)}
                    shouldShowClearBtn={shouldShowClearBtn}
                    shouldShowUploadBtn={shouldShowUploadBtnWithImg}
                    onUploadImage={makeFnWithDisabled(
                      handleClickUploadImage(image.id),
                    )}
                    uploadBtnWithImgClassName={uploadBtnWithImgClassName}
                  />
                ) : (
                  <label
                    htmlFor={input.name}
                    onClick={makeFnWithDisabled(() => {})}
                    className={classNames({
                      [css.label]: !filesChangeDisabledByToast,
                    })}>
                    <div
                      className={classNames(
                        css.iconUpload,
                        iconUploadClassName,
                      )}>
                      <RenderWhen condition={!shouldHideIconWhenEmpty}>
                        <ResponsiveImage
                          image={null}
                          alt={`${input.name} asset`}
                        />
                      </RenderWhen>
                    </div>

                    <div
                      className={classNames(
                        css.iconCameraContainer,
                        {
                          [css.hideIconCamera]: !shouldShowIconCameraWhenEmpty,
                        },
                        iconCameraClassName,
                      )}>
                      <IconCamera />
                    </div>
                  </label>
                )}
              </div>
              {uploadImageFailed && (
                <ErrorMessage message={uploadImageFailed} />
              )}
            </>
          ) : null;
        }}
      </Field>
    </>
  );
};

export default FieldPhotoUpload;
