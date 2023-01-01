import { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconClose from '@components/IconClose/IconClose';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import IconUpload from '@components/IconUpload/IconUpload';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { isUploadImageOverLimitError } from '@utils/errors';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './FieldPhotoUpload.module.scss';

const PhotoWithOverlay = (props: any) => {
  const {
    className,
    image,
    savedImageAltText,
    onRemoveImage,
    onClick,
    variants,
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
  return (
    <div onClick={onClick} className={css.previewImage}>
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
      <InlineTextButton
        type="button"
        className={css.removeButton}
        onClick={handleRemoveClick}>
        <IconClose />
      </InlineTextButton>
    </div>
  );
};

const FieldPhotoUpload: React.FC<any> = (props) => {
  const intl = useIntl();
  const [triggerFlag, setTriggerFlag] = useState<string>('');

  return (
    <>
      <Field initialValue={props.image} {...props}>
        {(fieldRenderProps: any) => {
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
            meta,
          } = fieldRenderProps;
          const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
            const { files } = e.target;

            const file = files && files[0];
            if (file) {
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
              <div className={classNames(css.root, className)}>
                <input {...inputProps} className={css.addImageInput} />
                {image ? (
                  <PhotoWithOverlay
                    id={image.imageId}
                    rootClassName={css.rootForImage}
                    image={image}
                    savedImageAltText={`${input.name} asset`}
                    variants={variants}
                    onRemoveImage={removeFn}
                  />
                ) : (
                  <label
                    htmlFor={input.name}
                    className={classNames(css.label, {
                      [css.error]: hasError,
                    })}>
                    <div className={css.iconUpload}>
                      <IconUpload />
                      <span className={css.uploadImageLabel}>
                        <FormattedMessage id="FieldPhotoUpload.uploadLabel" />
                      </span>
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
