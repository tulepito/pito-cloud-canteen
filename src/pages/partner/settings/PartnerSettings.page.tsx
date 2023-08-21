/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import { useViewport } from '@hooks/useViewport';
import { participantPaths } from '@src/paths';

import css from './PartnerSettingsPage.module.scss';

// const ACCEPT_IMAGES = 'image/*';

const PartnerSettingsPage = () => {
  const router = useRouter();

  const { isMobileLayout } = useViewport();

  useEffect(() => {
    if (!isMobileLayout) {
      router.push(participantPaths.AccountProfile);
    }
  }, [isMobileLayout]);

  const openProfileModal = () => {
    router.push(participantPaths.AccountProfile);
  };

  const openChangePasswordModal = () => {
    router.push(participantPaths.AccountChangePassword);
  };

  const openSpecialDemandModal = () => {
    router.push(participantPaths.AccountSpecialDemand);
  };

  return (
    <div className={css.container}>
      <div className={css.greyCircle}></div>
      <div className={css.avatarSection}>
        <div className={css.mediaFields}>
          <div className={css.mediaFieldGroup}>
            {/* <FieldPhotoUpload
              name="cover"
              accept={ACCEPT_IMAGES}
              id="cover"
              className={css.fieldCover}
              image={uploadedCovers?.[0]}
              variants={COVER_VARIANTS}
              onImageUpload={onCoverUpload}
              onRemoveImage={onRemoveCover}
              validate={nonEmptyImage(
                intl.formatMessage({
                  id: 'EditPartnerBasicInformationForm.coverRequired',
                }),
              )}
            />
            <FieldPhotoUpload
              name="avatar"
              image={uploadedAvatars?.[0]}
              accept={ACCEPT_IMAGES}
              id="avatar"
              className={css.fieldAvatar}
              onImageUpload={onAvatarUpload}
              onRemoveImage={onRemoveAvatar}
              variants={AVATAR_VARIANTS}
              validate={nonEmptyImage(
                intl.formatMessage({
                  id: 'EditPartnerBasicInformationForm.avatarRequired',
                }),
              )}
            />
            {uploadImageFailed && <ErrorMessage message={uploadImageFailed} />} */}
          </div>
        </div>
      </div>
      <div className={css.navigationWrapper}>
        <div className={css.navigationItem} onClick={openProfileModal}>
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
