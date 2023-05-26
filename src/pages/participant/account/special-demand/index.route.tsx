import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { AccountThunks } from '../Account.slice';
import SpecialDemandModal from '../components/SpecialDemandModal/SpecialDemandModal';

const AccountPageRoute = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const nutritionOptions = useAppSelector(
    (state) => state.ParticipantAccount.nutritions,
    shallowEqual,
  );
  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    dispatch(AccountThunks.fetchAttributes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
