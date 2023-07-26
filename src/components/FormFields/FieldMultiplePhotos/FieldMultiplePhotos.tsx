import React, { Fragment, useEffect, useState } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import ValidationError from '@components/ValidationError/ValidationError';
import { isUploadImageOverLimitError } from '@utils/errors';
import { getInitialAddImages } from '@utils/images';

import css from './FieldMultiplePhotos.module.scss';

const HiddenField = (hiddenProps: any) => {
  const { input, meta: fieldMeta, images } = hiddenProps;
  useEffect(() => {
    if (!input) return;
    input.onChange(getInitialAddImages(images));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(images)]);

  return (
    <div className={css.imageRequiredWrapper}>
      <input {...input} />
      <ValidationError fieldMeta={fieldMeta} />
    </div>
  );
};

const PhotoWithOverlay = (props: any) => {
  const { className, image, savedImageAltText, onRemoveImage, variants } =
    props;

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
    <div className={css.previewImage}>
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
        <IconClose className={css.iconClose} />
      </InlineTextButton>
    </div>
  );
};

const FieldMutiplePhotos = (props: any) => {
  const [triggerFlag, setTriggerFlag] = useState<string>('');
  const intl = useIntl();

  return (
    <FieldArray {...props}>
      {({
        fields,
        images,
        onImageUpload,
        onRemoveImage,
        uploadImageError,
        className,
        multiple = true,
        variants,
        inputClassName,
        validate,
        ...rest
      }: any) => {
        const classes = classNames(css.root, className);

        const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

        let uploadImageFailed = null;

        if (uploadOverLimit) {
          uploadImageFailed = (
            <p className={css.error}>
              {intl.formatMessage({
                id: 'FieldMutiplePhotos.imageUploadFailed.uploadOverLimit',
              })}
            </p>
          );
        } else if (uploadImageError) {
          uploadImageFailed = (
            <p className={css.error}>
              {intl.formatMessage({
                id: 'FieldMutiplePhotos.imageUploadFailed.uploadFailed',
              })}
            </p>
          );
        }

        return (
          <>
            <div className={classes}>
              {fields.map((_name: string, index: number) => {
                return (
                  <Fragment key={`${fields.name}[${index}]`}>
                    <Field
                      {...rest}
                      id={`addImages.[${index}]`}
                      name={`addImages.[${index}]`}>
                      {(fieldRenderProps) => {
                        const {
                          accept,
                          input,
                          disabled: fieldDisabled,
                        } = fieldRenderProps;
                        const onChange = async (e: any) => {
                          const files =
                            e.dataTransfer && e.dataTransfer.files.length > 0
                              ? [...e.dataTransfer.files]
                              : [...e.target.files];
                          const filesAsArray = Array.from(files);
                          await Promise.all(
                            filesAsArray.map(async (file: any) => {
                              const params = {
                                file,
                                id: `${file.name}_${new Date().getTime()}`,
                              };

                              input.onChange(params);
                              input.onBlur();

                              onImageUpload(params);
                              // To reset input files.
                              // The problem is when choose same file browser doesn't trigger on change
                              setTriggerFlag(
                                `${file.name}_${new Date().getTime()}`,
                              );
                            }),
                          );
                        };

                        const inputName = `${fields.name}[${index}]`;

                        const inputProps = {
                          key: triggerFlag,
                          accept,
                          id: inputName,
                          name: inputName,
                          onChange,
                          type: 'file',
                          multiple,
                        };
                        const image = images[index];

                        return (
                          <div
                            className={classNames(css.input, inputClassName)}>
                            {fieldDisabled ? null : (
                              <input
                                {...inputProps}
                                className={css.addImageInput}
                              />
                            )}
                            {image ? (
                              <PhotoWithOverlay
                                className={css.sessionPhoto}
                                onRemoveImage={onRemoveImage}
                                savedImageAltText={`${fields.name}[${index}] asset`}
                                image={image}
                                variants={variants}
                              />
                            ) : (
                              <label htmlFor={inputName} className={css.label}>
                                <div className={css.addPhotoWrapper}>
                                  <ResponsiveImage
                                    image={null}
                                    alt={`${fields.name}[${index}] asset`}
                                  />
                                </div>
                              </label>
                            )}
                          </div>
                        );
                      }}
                    </Field>
                  </Fragment>
                );
              })}
            </div>
            <Field
              component={HiddenField}
              name={props.name}
              images={images}
              type="hidden"
              validate={validate}
            />
            {uploadImageFailed}
          </>
        );
      }}
    </FieldArray>
  );
};

export default FieldMutiplePhotos;
