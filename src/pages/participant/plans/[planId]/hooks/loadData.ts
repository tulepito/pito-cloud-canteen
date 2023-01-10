import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import { ParticipantPlanThunks } from '../ParticipantPlanPage.slice';

export const useLoadData = () => {
  // Router
  const router = useRouter();
  const { planId } = router.query;

  // Ref
  const loadedData = useRef(false);

  // Redux selector
  const order = useAppSelector((state) => state.ParticipantPlanPage.order);
  const plan = useAppSelector((state) => state.ParticipantPlanPage.plan);

  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantPlanPage.loadDataInProgress,
  );

  const currentUser = useAppSelector((state) => state.user.currentUser);

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Effect
  useEffect(() => {
    if (router.isReady && currentUser?.id?.uuid && !loadedData.current) {
      loadedData.current = true;
      dispatch(ParticipantPlanThunks.loadData(`${planId}`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, currentUser?.id?.uuid]);

  return {
    order,
    plan,
    loadDataInProgress,
  };
};
