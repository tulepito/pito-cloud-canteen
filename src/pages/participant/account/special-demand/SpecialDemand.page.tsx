import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import ParticipantSidebar from '@components/ParticipantLayout/ParticipantSidebar/ParticipantSidebar';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { userThunks } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import { User } from '@src/utils/data';

import type { TSpecialDemandFormValues } from '../components/SpecialDemandForm/SpecialDemandForm';
import SpecialDemandForm from '../components/SpecialDemandForm/SpecialDemandForm';
import SpecialDemandModal from '../components/SpecialDemandModal/SpecialDemandModal';

import css from './SpecialDemand.module.scss';

const SpecialDemandPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const updateSpecialDemandSuccessModalControl = useBoolean();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = User(currentUser!);
  const { allergies = [], nutritions = [] } = currentUserGetter.getPublicData();
  const updateSpecialDemandInProgress = useAppSelector(
    (state) => state.user.updateProfileInProgress,
  );

  const nutritionOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );

  const handleGoBack = () => {
    router.push(participantPaths.Account);
  };

  const initialValues = useMemo(
    () => ({ allergies, nutritions }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(allergies), JSON.stringify(nutritions)],
  );
  const intl = useIntl();
  const handleSubmit = async (values: TSpecialDemandFormValues) => {
    const { meta } = await dispatch(
      userThunks.updateProfile({ publicData: { ...values } }),
    );

    if (meta.requestStatus === 'fulfilled') {
      updateSpecialDemandSuccessModalControl.setTrue();
    }
  };

  return (
    <div className={css.container}>
      <ParticipantSidebar title={intl.formatMessage({ id: 'tai-khoan' })} />

      <div className={css.desktopView}>
        <SpecialDemandForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          inProgress={updateSpecialDemandInProgress}
          nutritionOptions={nutritionOptions}
          view="desktop"
        />
      </div>

      <div className={css.mobileView}>
        <SpecialDemandModal
          isOpen={true}
          onClose={handleGoBack}
          nutritionOptions={nutritionOptions}
          handleSubmit={handleSubmit}
          currentUser={currentUser!}
          initialValues={initialValues}
          inProgress={updateSpecialDemandInProgress}
        />
      </div>
      <ConfirmationModal
        isPopup
        id="UpdateSpecialDemandSuccessModal"
        isOpen={updateSpecialDemandSuccessModalControl.value}
        onClose={updateSpecialDemandSuccessModalControl.setFalse}
        title="Thông báo"
        description="Cập nhật yêu cầu đặc biệt thành công!"
        secondForAutoClose={3}
      />
    </div>
  );
};

export default SpecialDemandPage;
