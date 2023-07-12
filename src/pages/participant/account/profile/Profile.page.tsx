import { useMemo } from 'react';
import { useRouter } from 'next/router';

import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import ParticipantSidebar from '@components/ParticipantLayout/ParticipantSidebar/ParticipantSidebar';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { userThunks } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import { User } from '@src/utils/data';
import { splitNameFormFullName } from '@src/utils/string';

import { AccountThunks } from '../Account.slice';
import type { TProfileFormValues } from '../components/ProfileForm/ProfileForm';
import ProfileForm from '../components/ProfileForm/ProfileForm';
import ProfileModal from '../components/ProfileModal/ProfileModal';

import css from './Profile.module.scss';

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const updateProfileSucessModalControl = useBoolean();

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const updateProfileInProgress = useAppSelector(
    (state) => state.ParticipantAccount.updateProfileInProgress,
  );

  const currentUserGetter = User(currentUser!);
  const { firstName, lastName } = currentUserGetter.getProfile();
  const { email } = currentUserGetter.getAttributes();
  const { phoneNumber } = currentUserGetter.getProtectedData();
  const initialValues = useMemo(
    () => ({ name: `${lastName} ${firstName}`, email, phoneNumber }),
    [email, firstName, lastName, phoneNumber],
  );

  const goBack = () => {
    router.push(participantPaths.Account);
  };

  const handleSubmit = async (values: TProfileFormValues) => {
    const { name: fullName, phoneNumber: phoneNumberValue } = values;
    const splitName = splitNameFormFullName(fullName);
    const { meta } = await dispatch(
      AccountThunks.updateProfile({
        firstName: splitName.firstName,
        lastName: splitName.lastName,
        phoneNumber: phoneNumberValue,
      }),
    );

    if (meta.requestStatus !== 'fulfilled') {
      console.log('error');
    } else {
      dispatch(userThunks.fetchCurrentUser());
      updateProfileSucessModalControl.setTrue();
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
          onClose={goBack}
          currentUser={currentUser!}
          handleSubmit={handleSubmit}
          initialValues={initialValues}
        />
      </div>
      <ConfirmationModal
        isPopup
        id="ProfileModalConfirmation"
        isOpen={updateProfileSucessModalControl.value}
        onClose={updateProfileSucessModalControl.setFalse}
        title="Thông báo"
        description="Thông tin của bạn đã được cập nhật thành công."
        secondForAutoClose={3}
      />
    </div>
  );
};

export default ProfilePage;
