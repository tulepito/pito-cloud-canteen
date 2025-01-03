/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import IconClose from '@components/Icons/IconClose/IconClose';
import PopupModal from '@components/PopupModal/PopupModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { userThunks } from '@redux/slices/user.slice';
import { User } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { splitNameFormFullName } from '@src/utils/string';
import type { TCurrentUser, TUser } from '@src/utils/types';

import type { TUpdateProfileFormValues } from '../UpdateProfileForm/UpdateProfileForm';
import UpdateProfileForm from '../UpdateProfileForm/UpdateProfileForm';

import css from './UpdateProfileModal.module.scss';

type UpdateProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: TCurrentUser | TUser;
  handleOnBoardingModalOpen: () => void;
  handleCloseWalkThrough?: () => void;
};

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    currentUser,
    handleOnBoardingModalOpen,
    handleCloseWalkThrough,
  } = props;
  const dispatch = useAppDispatch();
  const nutritionOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );
  const updateProfileInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.updateProfileInProgress,
  );
  const currentUserGetter = User(currentUser as TUser);
  const { firstName, lastName, displayName } = currentUserGetter.getProfile();
  const { phoneNumber } = currentUserGetter.getProtectedData();
  const { allergies = [], nutritions = [] } = currentUserGetter.getPublicData();

  const initialValues = useMemo(
    () => ({
      name: buildFullName(firstName, lastName, {
        compareToGetLongerWith: displayName,
      }),
      phoneNumber,
      allergies,
      nutritions,
    }),
    [
      JSON.stringify(allergies),
      JSON.stringify(nutritions),
      firstName,
      lastName,
      phoneNumber,
    ],
  );

  const handleSubmit = async (values: TUpdateProfileFormValues) => {
    const { name: fullName } = values;
    const splitName = splitNameFormFullName(fullName);
    const params = {
      firstName: splitName.firstName,
      lastName: splitName.lastName,
      protectedData: {
        phoneNumber: values.phoneNumber,
      },
      publicData: {
        allergies: values.allergies,
        nutritions: values.nutritions,
      },
    };
    await dispatch(userThunks.updateProfile(params));
    onClose();
    setTimeout(() => {
      handleOnBoardingModalOpen();
    }, 0);
  };

  return (
    <PopupModal
      id="UpdateProfileModal"
      isOpen={isOpen}
      handleClose={() => {}}
      shouldHideIconClose
      customHeader={
        <div className={css.modalHeader}>
          <div className={css.title}>Hoàn thiện hồ sơ cá nhân</div>
          <IconClose
            className={css.closeIcon}
            onClick={handleCloseWalkThrough}
          />
        </div>
      }
      containerClassName={css.modalContainer}>
      <>
        <UpdateProfileForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          nutritionOptions={nutritionOptions}
          inProgress={updateProfileInProgress}
        />
      </>
    </PopupModal>
  );
};

export default UpdateProfileModal;
