import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

import type { TIntegrationListing, TListing } from '@utils/types';

const tabsActive = (
  isNew: boolean,
  listing: any,
  tabs: string[],
  tabCompleted: (tab: string, listing: TListing | TIntegrationListing) => void,
) => {
  return tabs.reduce((acc, tab) => {
    const previousTabIndex = tabs.findIndex((t) => t === tab) - 1;
    const isActive =
      previousTabIndex < 0 ||
      !isNew ||
      tabCompleted(tabs[previousTabIndex], listing);

    return { ...acc, [tab]: isActive };
  }, {});
};

type TUseRedirectTabWizard = {
  isNew: boolean;
  listing: TListing | TIntegrationListing;
  selectedTab: string;
  tabs: string[];
  tabCompleted: (
    tab: string,
    listing: TListing | TIntegrationListing,
  ) => boolean;
  handleRedirect: (nearestActiveTab: string) => void;
};

const useRedirectTabWizard = ({
  isNew,
  listing,
  selectedTab,
  tabs,
  tabCompleted,
  handleRedirect,
}: TUseRedirectTabWizard) => {
  const listingRef = useRef(null) as MutableRefObject<
    TListing | TIntegrationListing | null
  >;
  const tabsStatus = tabsActive(isNew, listing, tabs, tabCompleted) as any;
  useEffect(() => {
    // If selectedTab is not active, redirect to the beginning of wizard
    if (!tabsStatus[selectedTab as string]) {
      const currentTabIndex = tabs.indexOf(selectedTab as string);
      const nearestActiveTab = tabs
        .slice(0, currentTabIndex)
        .reverse()
        .find((t) => tabsStatus[t]);

      const shouldRedirect =
        nearestActiveTab &&
        !listingRef.current &&
        !isEqual(listingRef.current, listing);
      if (shouldRedirect) {
        handleRedirect(nearestActiveTab);
        listingRef.current = listing;
      }
    }
  }, [
    tabsStatus,
    selectedTab,
    JSON.stringify(tabs),
    handleRedirect,
    JSON.stringify(listing),
  ]);
};

export default useRedirectTabWizard;
