/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldPhotoUpload from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths, partnerPaths } from '@src/paths';
import { OwnListing } from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';
import { isUploadImageOverLimitError } from '@src/utils/errors';
import { pickRenderableImagesByProperty } from '@src/utils/images';
import type { TObject } from '@src/utils/types';
import { nonEmptyImage } from '@src/utils/validators';

import {
  PartnerSettingsActions,
  PartnerSettingsThunks,
} from './PartnerSettings.slice';

import css from './PartnerSettingsPage.module.scss';

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';
const COVER_VARIANTS = [EImageVariants.scaledXLarge];
const AVATAR_VARIANTS = [EImageVariants.squareSmall2x];

const PartnerSettingsPage = () => {
  const intl = useIntl();
  const router = useRouter();
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
  const currentUser = useAppSelector(currentUserSelector);

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

  const { title } = OwnListing(restaurantListing).getAttributes();
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

  const handleNavigateToAccountSettingsPage = () => {
    router.push(partnerPaths.AccountSettings);
  };

  const openChangePasswordModal = () => {
    router.push(partnerPaths.ChangePassword);
  };

  const openSpecialDemandModal = () => {
    router.push(participantPaths.AccountSpecialDemand);
  };

  useEffect(() => {
    if (currentUser === null) return;

    dispatch(PartnerSettingsThunks.loadData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(currentUser)]);

  return (
    <div className={css.container}>
      <FinalForm
        onSubmit={() => {}}
        render={() => {
          return (
            <Form>
              <div className={css.avatarSection}>
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

      <div className={css.title}>{title}</div>

      <div className={css.navigationWrapper}>
        <div
          className={css.navigationItem}
          onClick={handleNavigateToAccountSettingsPage}>
          <div className={css.iconGroup}>
            <IconUser />
            <span>Cài đặt tài khoản</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.navigationItem} onClick={openSpecialDemandModal}>
          <div className={css.iconGroup}>
            <IconFood />
            <span>Cài đặt nhà hàng</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.navigationItem} onClick={openChangePasswordModal}>
          <div className={css.iconGroup}>
            <IconLock />
            <span>Đổi mật khẩu</span>
          </div>
          <IconArrow direction="right" />
        </div>
      </div>
    </div>
  );
};

export default PartnerSettingsPage;
