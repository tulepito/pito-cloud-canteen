import { useEffect } from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import HighlightBox from '@components/HighlightBox/HighlightBox';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconPlusWithoutBorder from '@components/Icons/IconPlusWithoutBorder/IconPlusWithoutBorder';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import ValidationError from '@components/ValidationError/ValidationError';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import type { TImageActionPayload } from '@redux/slices/uploadImage.slice';
import {
  removeImage,
  uploadImageThunks,
} from '@redux/slices/uploadImage.slice';
import type { EImageVariants } from '@src/utils/enums';
import { isUploadImageOverLimitError } from '@src/utils/errors';
import { getInitialAddImages } from '@src/utils/images';
import type { TObject } from '@src/utils/types';

import css from './FieldMultiplePhotosMobile.module.scss';

const ACCEPT_IMAGES = 'image/*';
const MAX_FILES = 5;
type TFieldMultiplePhotosMobileProps = {
  images: TObject;
  containerClassName?: string;
  labelClassName?: string;
  name: string;
  variants: EImageVariants[];
  label?: string;
  hintShowed?: boolean;
};

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

const UploadImageError = (image: any) => {
  const { uploadError } = image;
  let error = null;
  if (isUploadImageOverLimitError(uploadError)) {
    error = (
      <div className={css.error}>
        <FormattedMessage id="FieldAvatar.imageUploadFailedFileTooLarge" />
      </div>
    );
  } else if (uploadError) {
    error = (
      <div className={css.error}>
        <FormattedMessage id="FieldAvatar.imageUploadFailed" />
      </div>
    );
  }

  return error;
};

const FieldMultiplePhotosMobile: React.FC<TFieldMultiplePhotosMobileProps> = (
  props,
) => {
  const {
    images,
    containerClassName,
    labelClassName,
    name: fieldName,
    variants,
    label,
    hintShowed,
  } = props;

  const dispatch = useAppDispatch();
  const imageUploadRequestControl = useBoolean();

  const allImages = Object.values(images);
  const allUploadedImages = allImages.map((image: any) => image.uploadedImage);

  const uploadedImagesLength = allImages.length;
  const maxImages = Object.keys(images).length === MAX_FILES;
  const containerClasses = classNames(css.container, containerClassName);
  const labelClassses = classNames(css.labelRoot, labelClassName);

  const uploadImageInProgress = useAppSelector(
    (state) => state.uploadImage.uploadImageInProgress,
  );
  const onImagesUpload = async (params: TImageActionPayload[]) => {
    await dispatch(uploadImageThunks.uploadImages(params));
  };
  const onImageUploadHandler = async (fileList: any[]) => {
    if (fileList.length > 0) {
      imageUploadRequestControl.setTrue();
      try {
        const uploadImagesParams = fileList.map((file) => ({
          id: `${file.name}_${Date.now()}`,
          file,
        }));
        await onImagesUpload(uploadImagesParams);
        imageUploadRequestControl.setFalse();
      } catch (error) {
        imageUploadRequestControl.setFalse();
      }
    }
  };
  const processImageFilesBeforeUpload = (files: any[]) => {
    const fileList = Array.from(files);
    const canUploadImageLength = MAX_FILES - uploadedImagesLength;
    const canUploadFileList =
      fileList.length >= canUploadImageLength
        ? fileList.slice(0, canUploadImageLength)
        : fileList;
    onImageUploadHandler(canUploadFileList);
  };

  const handleDrag = (e: any) => {
    e.preventDefault();
  };

  const onDeleteImage = (imageId: string) => () => {
    dispatch(removeImage(imageId));
  };

  return (
    <div className={css.root}>
      {label && (
        <label className={labelClassses} htmlFor={'addImage'}>
          {label}
        </label>
      )}

      <Field
        id="addImage"
        name="addImage"
        accept={ACCEPT_IMAGES}
        form={null}
        type="file">
        {(fieldProps: any) => {
          const { accept, input, disabled: fieldDisabled } = fieldProps;
          const { name, type } = input;
          const onChange = (e: any) => {
            const { files } = e.target;
            processImageFilesBeforeUpload(files);
          };
          const handleDrop = (e: any) => {
            e.preventDefault();
            const { files } = e.dataTransfer;
            processImageFilesBeforeUpload(files);
          };
          const inputProps = {
            accept,
            id: name,
            name,
            onChange,
            type,
          };

          return (
            <>
              {fieldDisabled ? null : (
                <input
                  {...inputProps}
                  multiple
                  disabled={maxImages}
                  className={css.addImageInput}
                  key={new Date().getTime()}
                />
              )}

              <div
                className={containerClasses}
                onDrop={handleDrop}
                onDragOver={handleDrag}
                onDragEnter={handleDrag}>
                <label htmlFor={name}>
                  <div className={css.uploadImageLabel}>
                    <IconPlusWithoutBorder className={css.iconPlus} />
                    <div className={css.firstText}>Chọn ảnh</div>
                  </div>
                </label>
                <>
                  {allImages.map((image: any) => {
                    return (
                      <div
                        key={image.id || image.imageId.uuid}
                        className={css.imageWrapper}>
                        <div
                          className={css.deleteImageBtn}
                          onClick={onDeleteImage(
                            image.id || image.imageId.uuid,
                          )}>
                          <IconClose className={css.deleteIcon} />
                        </div>
                        <RenderWhen
                          condition={uploadImageInProgress && !image.imageId}>
                          <div className={css.loadingUpload}>
                            <IconSpinner />
                          </div>
                        </RenderWhen>
                        <RenderWhen condition={!!image.file}>
                          <ImageFromFile
                            id={image.id}
                            file={image.file}
                            className={css.image}></ImageFromFile>
                          <RenderWhen.False>
                            <div className={css.img}>
                              <ResponsiveImage
                                rootClassName={css.image}
                                image={image.uploadedImage}
                                alt={''}
                                variants={variants}
                              />
                            </div>
                          </RenderWhen.False>
                        </RenderWhen>
                        <UploadImageError {...image} />
                      </div>
                    );
                  })}
                </>
              </div>
            </>
          );
        }}
      </Field>
      <Field
        component={HiddenField}
        name={fieldName}
        images={allUploadedImages}
        type="hidden"
      />

      {hintShowed && (
        <HighlightBox>
          <FormattedMessage id="FieldMultiplePhotosMobile.hint" />
        </HighlightBox>
      )}
    </div>
  );
};

export default FieldMultiplePhotosMobile;
