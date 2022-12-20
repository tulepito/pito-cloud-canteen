import IconClose from '@components/IconClose/IconClose';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import IconUpload from '@components/IconUpload/IconUpload';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import React from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import css from './FieldPhotoUpload.module.scss';

const SESSION_PHOTO_VARIANTS = ['square-small', 'square-small2x'];

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
      <button
        type="button"
        className={css.removeButton}
        onClick={handleRemoveClick}>
        <IconClose size="small" />
      </button>
    </div>
  );
};

const FieldPhotoUpload: React.FC<any> = (props) => {
  return (
    <Field {...props}>
      {(fieldRenderProps: any) => {
        const {
          accept,
          input,
          disabled: fieldDisabled,
          onImageUpload,
          name,
          image,
          className,
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
            onImageUpload(params);
          }
        };

        const inputProps = {
          accept,
          id: input.name,
          name: input.name,
          onChange,
          type: 'file',
        };

        return !fieldDisabled ? (
          <div className={classNames(css.root, className)}>
            <input {...inputProps} className={css.addImageInput} />
            {image ? (
              <PhotoWithOverlay
                id={image.imageId}
                rootClassName={css.rootForImage}
                image={image}
                savedImageAltText={`${name} asset`}
                variants={SESSION_PHOTO_VARIANTS}
              />
            ) : (
              <label htmlFor={input.name} className={css.label}>
                <div className={css.iconUpload}>
                  <IconUpload />
                  <span className={css.uploadImageLabel}>
                    <FormattedMessage id="FieldPhotoUpload.uploadLabel" />
                  </span>
                </div>
              </label>
            )}
          </div>
        ) : null;
      }}
    </Field>
  );
};

export default FieldPhotoUpload;
