import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppSelector } from '@hooks/reduxHooks';

import SpecialDemandModal from '../components/SpecialDemandModal/SpecialDemandModal';

const AccountPageRoute = () => {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const nutritionOptions = useAppSelector(
    (state) => state.ParticipantAccount.nutritions,
    shallowEqual,
  );
  const goBack = () => {
    router.back();
  };

  return (
    <MetaWrapper>
      <SpecialDemandModal
        isOpen={true}
        onClose={goBack}
        nutritionOptions={nutritionOptions}
        currentUser={currentUser!}
      />
    </MetaWrapper>
  );
};

export default AccountPageRoute;
