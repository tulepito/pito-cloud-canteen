import { Field } from 'react-final-form';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconImage from '@components/Icons/IconImage/IconImage';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import { useAppDispatch } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import type { TImageActionPayload } from '@redux/slices/uploadImage.slice';
import {
  removeImage,
  uploadImageThunks,
} from '@redux/slices/uploadImage.slice';

import css from './RatingImagesUploadField.module.scss';

const ACCEPT_IMAGES = 'image/*';
const MAX_FILES = 5;

type TRatingImagesUploadFieldProps = {
  images: {};
};
const RatingImagesUploadField: React.FC<TRatingImagesUploadFieldProps> = ({
  images,
}) => {
  const dispatch = useAppDispatch();
  const imageUploadRequestControl = useBoolean();

  const allImages = Object.values(images);

  const uploadedImagesLength = allImages.length;
  const maxImages = Object.keys(images).length === MAX_FILES;
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
    <>
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
                  className={css.addImageInput}
                  key={new Date().getTime()}
                />
              )}
              {!maxImages && (
                <div
                  className={css.container}
                  onDrop={handleDrop}
                  onDragOver={handleDrag}
                  onDragEnter={handleDrag}>
                  <label htmlFor={name}>
                    <div className={css.uploadImageLabel}>
                      <IconImage />
                      <div className={css.firstText}>
                        <b>Chọn</b> hoặc <b>Kéo</b> thả ảnh của bạn vào đây
                      </div>
                      <div className={css.secondText}>
                        Hỗ trợ định dạng png, jpeg.
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </>
          );
        }}
      </Field>
      <div className={css.imageList}>
        {allImages.map((image: any) => {
          return (
            <div key={image.id} className={css.imageWrapper}>
              <div
                className={css.deleteImageBtn}
                onClick={onDeleteImage(image.id)}>
                <IconClose className={css.deleteIcon} />
              </div>
              <ImageFromFile
                id={image.id}
                file={image.file}
                className={css.image}></ImageFromFile>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RatingImagesUploadField;
