import { useMemo } from 'react';
import { useRouter } from 'next/router';

import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import ParticipantSidebar from '@components/ParticipantLayout/ParticipantSidebar/ParticipantSidebar';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { userThunks } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import { User } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { splitNameFormFullName } from '@src/utils/string';

import type { TProfileFormValues } from '../components/ProfileForm/ProfileForm';
import ProfileForm from '../components/ProfileForm/ProfileForm';
import ProfileModal from '../components/ProfileModal/ProfileModal';

import css from './Profile.module.scss';

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const updateProfileSuccessModalControl = useBoolean();

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const updateProfileInProgress = useAppSelector(
    (state) => state.user.updateProfileInProgress,
  );

  const currentUserGetter = User(currentUser!);
  const { firstName, lastName, displayName } = currentUserGetter.getProfile();
  const { email } = currentUserGetter.getAttributes();
  const { phoneNumber } = currentUserGetter.getProtectedData();
  const initialValues = useMemo(
    () => ({
      name: buildFullName(firstName, lastName, {
        compareToGetLongerWith: displayName,
      }),
      email,
      phoneNumber,
    }),
    [displayName, email, firstName, lastName, phoneNumber],
  );

  const handleGoBack = () => {
    router.push(participantPaths.Account);
  };

  const handleSubmit = async (values: TProfileFormValues) => {
    const { name: fullName, phoneNumber: phoneNumberValue } = values;
    const splitName = splitNameFormFullName(fullName);
    const { meta } = await dispatch(
      userThunks.updateProfile({
        firstName: splitName.firstName,
        lastName: splitName.lastName,
        protectedData: {
          phoneNumber: phoneNumberValue,
        },
      }),
    );

    if (meta.requestStatus !== 'fulfilled') {
      console.log('error');
    } else {
      updateProfileSuccessModalControl.setTrue();
    }
  };

  return (
    <div className={css.container}>
      <ParticipantSidebar title="Tài khoản" />

      <div className={css.desktopView}>
        <ProfileForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          inProgress={updateProfileInProgress}
          currentUser={currentUser!}
        />
      </div>

      <div className={css.mobileView}>
        <ProfileModal
          isOpen={true}
          onClose={handleGoBack}
          currentUser={currentUser!}
          handleSubmit={handleSubmit}
          initialValues={initialValues}
        />
      </div>
      <ConfirmationModal
        isPopup
        id="ProfileModalConfirmation"
        isOpen={updateProfileSuccessModalControl.value}
        onClose={updateProfileSuccessModalControl.setFalse}
        title="Thông báo"
        description="Thông tin của bạn đã được cập nhật thành công."
        secondForAutoClose={3}
      />
    </div>
  );
};

export default ProfilePage;
