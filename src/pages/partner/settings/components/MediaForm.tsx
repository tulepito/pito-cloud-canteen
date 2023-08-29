import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldPhotoUpload from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { EImageVariants } from '@src/utils/enums';
import { isUploadImageOverLimitError } from '@src/utils/errors';
import { pickRenderableImagesByProperty } from '@src/utils/images';
import type { TObject } from '@src/utils/types';
import { nonEmptyImage } from '@src/utils/validators';

import {
  PartnerSettingsActions,
  PartnerSettingsThunks,
} from '../PartnerSettings.slice';

import css from './MediaForm.module.scss';

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';
const COVER_VARIANTS = [EImageVariants.scaledXLarge];
const AVATAR_VARIANTS = [EImageVariants.squareSmall2x];

type TMediaFormProps = {};

const MediaForm: React.FC<TMediaFormProps> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const {
    uploadedCovers,
    uploadCoverError,
    uploadedCoversOrder,
    removedCoverIds,
    uploadedAvatars,
    uploadAvatarError,
    uploadedAvatarsOrder,
    removedAvatarIds,
    restaurantListing,
  } = useAppSelector((state) => state.PartnerSettingsPage);

  const uploadedCoverImages = pickRenderableImagesByProperty(
    restaurantListing,
    uploadedCovers,
    uploadedCoversOrder,
    removedCoverIds,
    'coverImageId',
  );
  const uploadedAvatarImages = pickRenderableImagesByProperty(
    restaurantListing,
    uploadedAvatars,
    uploadedAvatarsOrder,
    removedAvatarIds,
    'avatarImageId',
  );

  const uploadImageError = uploadCoverError || uploadAvatarError;
  const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

  let uploadImageFailed: string | undefined;

  if (uploadOverLimit) {
    uploadImageFailed = intl.formatMessage({
      id: 'FieldPhotoUpload.imageUploadFailed.uploadOverLimit',
    });
  } else if (uploadImageError) {
    uploadImageFailed = intl.formatMessage({
      id: 'FieldPhotoUpload.imageUploadFailed.uploadFailed',
    });
  }

  const handleCoverUpload = (params: TObject) => {
    return dispatch(PartnerSettingsThunks.requestCoverUpload(params));
  };
  const handleRemoveCover = (id: any) => {
    return dispatch(PartnerSettingsActions.removeCover(id));
  };

  const handleUploadAvatar = (params: TObject) => {
    return dispatch(PartnerSettingsThunks.requestAvatarUpload(params));
  };
  const handleRemoveAvatar = (id: any) => {
    return dispatch(PartnerSettingsActions.removeAvatar(id));
  };

  return (
    <FinalForm
      onSubmit={() => {}}
      render={() => {
        return (
          <Form>
            <div className={css.root}>
              <div className={css.title}>Hình Nền Và Ảnh Đại Diện</div>

              <div className={css.mediaFields}>
                <div className={css.mediaFieldGroup}>
                  <FieldPhotoUpload
                    name="cover"
                    accept={ACCEPT_IMAGES}
                    id="cover"
                    className={css.fieldCover}
                    image={uploadedCoverImages?.[0]}
                    variants={COVER_VARIANTS}
                    onImageUpload={handleCoverUpload as any}
                    onRemoveImage={handleRemoveCover}
                    iconUploadClassName={css.coverIconUpload}
                    shouldHideIconWhenEmpty
                    shouldShowClearBtn={false}
                  />
                  <FieldPhotoUpload
                    name="avatar"
                    image={uploadedAvatarImages?.[0]}
                    accept={ACCEPT_IMAGES}
                    id="avatar"
                    className={css.fieldAvatar}
                    onImageUpload={handleUploadAvatar as any}
                    onRemoveImage={handleRemoveAvatar}
                    variants={AVATAR_VARIANTS}
                    validate={nonEmptyImage(
                      intl.formatMessage({
                        id: 'EditPartnerBasicInformationForm.avatarRequired',
                      }),
                    )}
                    iconCameraClassName={css.avatarIconUpload}
                    shouldHideIconWhenEmpty
                    shouldShowClearBtn={false}
                  />

                  {uploadImageFailed && (
                    <ErrorMessage message={uploadImageFailed} />
                  )}
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default MediaForm;
