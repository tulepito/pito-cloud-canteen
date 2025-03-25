import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { ScannerThunks } from '@redux/slices/scanner.slice';
import { enGeneralPaths } from '@src/paths';

import { LoadingWrapper } from './LoadingWrapper';

export function PlanAllowToScanGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { planListingInProgress, planListing } = useAppSelector(
    (state) => state.scanner,
  );
  const router = useRouter();
  const dispatch = useAppDispatch();

  /**
   * Fetch plan listing when the page is loaded
   */
  useEffect(() => {
    dispatch(
      ScannerThunks.fetchPlanListing({ planId: router.query.planId as string }),
    );
  }, [dispatch, router.query.planId]);

  /**
   * Listen and check whether the plan is allowed to scan
   */
  useEffect(() => {
    if (planListing && !planListingInProgress) {
      if (!planListing.attributes?.metadata?.allowToScan) {
        toast.error('Tuần ăn này không cho phép scan', {
          toastId: 'Scanner:plan-not-allowed',
        });
        router.push(enGeneralPaths.auth.index);
      }
    }
  }, [planListing, planListingInProgress, router]);

  return (
    <LoadingWrapper isLoading={planListingInProgress}>
      {children}
    </LoadingWrapper>
  );
}
