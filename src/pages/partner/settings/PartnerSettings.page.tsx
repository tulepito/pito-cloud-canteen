/* eslint-disable react-hooks/exhaustive-deps */
import { Form as FinalForm } from 'react-final-form';
import { useRouter } from 'next/router';

import Form from '@components/Form/Form';
import FieldPhotoUpload from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import { useAppDispatch } from '@hooks/reduxHooks';
import { partnerThunks, removeCover } from '@redux/slices/partners.slice';
import { participantPaths } from '@src/paths';
import { EImageVariants } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import css from './PartnerSettingsPage.module.scss';

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';
const COVER_VARIANTS = [EImageVariants.scaledXLarge];

const PartnerSettingsPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const handleCoverUpload = (params: TObject) => {
    return dispatch(partnerThunks.requestCoverUpload(params));
  };
  const handleRemoveCover = (id: any) => {
    return dispatch(removeCover(id));
  };

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
                      image={undefined}
                      variants={COVER_VARIANTS}
                      onImageUpload={handleCoverUpload as any}
                      onRemoveImage={handleRemoveCover}
                      iconUploadClassName={css.coverIconUpload}
                    />

                    {/* {uploadImageFailed && <ErrorMessage message={uploadImageFailed} />} */}
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      />
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
