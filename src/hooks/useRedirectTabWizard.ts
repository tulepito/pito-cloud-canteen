/* eslint-disable react-hooks/exhaustive-deps */
import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';

import type { TCompany, TIntegrationListing, TListing } from '@utils/types';

const tabsActive = (
  isNew: boolean,
  entity: any,
  tabs: string[],
  tabCompleted: (
    tab: string,
    entity: TListing | TIntegrationListing | TCompany,
  ) => boolean,
) => {
  return tabs.reduce((acc, tab) => {
    const previousTabIndex = tabs.findIndex((t) => t === tab) - 1;
    const isActive =
      previousTabIndex < 0 ||
      !isNew ||
      tabCompleted(tabs[previousTabIndex], entity);

    return { ...acc, [tab]: isActive };
  }, {});
};

type TUseRedirectTabWizard = {
  isNew: boolean;
  entity: TListing | TIntegrationListing | TCompany;
  selectedTab: string;
  tabs: string[];
  tabCompleted: (
    tab: string,
    entity: TListing | TIntegrationListing | TCompany,
  ) => boolean;
  handleRedirect: (nearestActiveTab: string) => void;
};

const useRedirectTabWizard = ({
  isNew,
  entity,
  selectedTab,
  tabs,
  tabCompleted,
  handleRedirect,
}: TUseRedirectTabWizard) => {
  const entityRef = useRef(null) as MutableRefObject<
    TListing | TIntegrationListing | TCompany | null
  >;
  const tabsStatus = tabsActive(isNew, entity, tabs, tabCompleted) as any;
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
        !entityRef.current &&
        !isEqual(entityRef.current, entity);
      if (shouldRedirect) {
        handleRedirect(nearestActiveTab);
        entityRef.current = entity;
      }
    }
  }, [tabsStatus, selectedTab, tabs, handleRedirect, JSON.stringify(entity)]);
};

export default useRedirectTabWizard;
