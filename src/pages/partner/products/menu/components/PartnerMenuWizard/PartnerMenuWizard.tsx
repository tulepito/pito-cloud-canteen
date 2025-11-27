import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import type { FormApi } from 'final-form';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import type { TFormTabChildrenProps } from '@components/FormWizard/FormTabs/FormTabs';
import FormWizard from '@components/FormWizard/FormWizard';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useRedirectTabWizard from '@hooks/useRedirectTabWizard';
import EditMenuCompleteForm from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditMenuCompleteForm/EditMenuCompleteForm';
import EditMenuInformationForm from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditMenuInformationForm/EditMenuInformationForm';
import EditMenuPricingForm from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditMenuPricingForm/EditMenuPricingForm';
import type { TEditMenuFormValues } from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditPartnerMenuWizard/utils';
import {
  EDIT_PARTNER_MENU_TABS,
  MENU_COMPLETE_TAB,
  MENU_INFORMATION_TAB,
  MENU_PRICING_TAB,
} from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditPartnerMenuWizard/utils';
import { partnerPaths } from '@src/paths';
import { CurrentUser, IntegrationMenuListing } from '@src/utils/data';
import { EListingStates } from '@utils/enums';
import type { TCompany, TIntegrationListing, TListing } from '@utils/types';

import {
  PartnerManageMenusActions,
  PartnerManageMenusThunks,
} from '../../PartnerManageMenus.slice';

import { useMenuDataMerge } from './hooks/useMenuDataMerge';
import { useMenuSubmit } from './hooks/useMenuSubmit';

import css from './PartnerMenuWizard.module.scss';

export type TFormRefObject = React.MutableRefObject<
  FormApi<TEditMenuFormValues, Partial<TEditMenuFormValues>> | undefined
>;

type TSetSubmittedValues = (values: TEditMenuFormValues | null) => void;

type TPartnerMenuTabProps = {
  tab: string;
  formRef: TFormRefObject;
  menuId?: string;
  restaurantId: string;
  currentMenu?: TIntegrationListing | null;
  setSubmittedValues: TSetSubmittedValues;
} & TFormTabChildrenProps;

const PartnerMenuTab = (props: TPartnerMenuTabProps) => {
  const {
    tab: activeTab,
    formRef,
    restaurantId,
    currentMenu,
    menuId,
    setSubmittedValues,
  } = props;

  // Use custom hook to merge menu data
  const { snapshot, syntheticMenu, anchorDate, foodByDateToRender } =
    useMenuDataMerge({
      currentMenu: currentMenu ?? null,
      menuId,
      restaurantId,
    });

  // Use custom hook to handle submit logic
  const { handleSubmit } = useMenuSubmit({
    activeTab,
    menuId,
    restaurantId,
    snapshot,
    currentMenu: currentMenu ?? null,
  });

  // Build initial values for form based on active tab
  const initialValues = useMemo(() => {
    switch (activeTab) {
      case MENU_INFORMATION_TAB:
        return {
          title: snapshot.title,
          menuType: snapshot.menuType,
          mealType: snapshot.mealType,
          startDate: snapshot.startDate,
          daysOfWeek: snapshot.daysOfWeek,
          numberOfCycles: snapshot.numberOfCycles,
          endDate: snapshot.endDate,
        };
      case MENU_PRICING_TAB:
        return {
          foodsByDate: foodByDateToRender,
        };
      case MENU_COMPLETE_TAB:
        return {
          foodsByDate: foodByDateToRender,
          daysOfWeek: snapshot.daysOfWeek,
        };
      default:
        return {} as TEditMenuFormValues;
    }
  }, [activeTab, snapshot, foodByDateToRender]) as TEditMenuFormValues;

  const onSubmit = (values: Record<string, unknown>): Promise<void> => {
    return handleSubmit(values as TEditMenuFormValues, setSubmittedValues);
  };

  switch (activeTab) {
    case MENU_INFORMATION_TAB: {
      return (
        <EditMenuInformationForm
          initialValues={initialValues}
          formRef={formRef}
          onSubmit={onSubmit}
        />
      );
    }
    case MENU_PRICING_TAB: {
      return (
        <EditMenuPricingForm
          anchorDate={anchorDate}
          formRef={formRef}
          initialValues={initialValues}
          onSubmit={onSubmit}
          currentMenu={syntheticMenu as TIntegrationListing}
          restaurantId={restaurantId}
        />
      );
    }

    case MENU_COMPLETE_TAB: {
      return (
        <EditMenuCompleteForm
          anchorDate={anchorDate}
          onSubmit={onSubmit}
          formRef={formRef}
          initialValues={initialValues}
          currentMenu={syntheticMenu}
          restaurantId={restaurantId}
        />
      );
    }

    default:
      return <></>;
  }
};

const tabCompleted = (tab: string, listing: TIntegrationListing): boolean => {
  const {
    mealType,
    startDate,
    daysOfWeek = [],
  } = IntegrationMenuListing(listing).getPublicData();
  const { menuType } = IntegrationMenuListing(listing).getMetadata();

  const informationTabCompleted = !!(
    menuType &&
    mealType &&
    startDate &&
    daysOfWeek.length > 0
  );

  const listFoodIds = IntegrationMenuListing(listing).getListFoodIds();

  switch (tab) {
    case MENU_INFORMATION_TAB:
      return informationTabCompleted;
    case MENU_PRICING_TAB:
      return listFoodIds.length > 0;
    case MENU_COMPLETE_TAB:
      return !!(informationTabCompleted && listFoodIds);
    default:
      return informationTabCompleted;
  }
};

const PartnerMenuWizard = () => {
  const router = useRouter();
  const { query, pathname } = router;
  const formRef =
    useRef<FormApi<TEditMenuFormValues, Partial<TEditMenuFormValues>>>();
  const [submittedValues, setSubmittedValues] = useState<
    TEditMenuFormValues | null | undefined
  >();
  const intl = useIntl();
  const { tab = MENU_INFORMATION_TAB, menuId } = query;
  const selectedTab = tab || MENU_INFORMATION_TAB;

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = currentUser ? CurrentUser(currentUser) : null;
  const restaurantId = currentUserGetter?.getMetadata()?.restaurantListingId;

  // Get menu from PartnerManageMenus slice
  const menu = useAppSelector(
    (state) => state.PartnerManageMenus.menu,
    shallowEqual,
  );

  const {
    loadMenuDataInProgress,
    createDraftMenuInProgress,
    updateDraftMenuInProgress,
    publishDraftMenuInProgress,
    createDraftMenuError,
    updateDraftMenuError,
    publishDraftMenuError,
  } = useAppSelector((state) => state.PartnerManageMenus);

  const currentMenu = menu as TIntegrationListing | null;

  const tabLink = (tabName: string) => {
    return {
      path: !menuId
        ? pathname
        : partnerPaths.EditMenu.replace('[menuId]', menuId as string),
      to: {
        search: `tab=${tabName}`,
      },
    };
  };

  const isNew =
    !currentMenu ||
    (currentMenu &&
      currentMenu?.attributes?.metadata?.listingState === EListingStates.draft);

  const handleRedirectOnSwitchTab = (nearestActiveTab: string) => {
    if (!currentMenu) {
      router.push(`${partnerPaths.CreateMenu}?tab=${nearestActiveTab}`);
    } else {
      router.push(
        `${partnerPaths.EditMenu.replace(
          '[menuId]',
          menuId as string,
        )}?tab=${nearestActiveTab}`,
      );
    }
  };

  useRedirectTabWizard({
    isNew,
    entity: currentMenu as TIntegrationListing,
    selectedTab: tab as string,
    tabs: EDIT_PARTNER_MENU_TABS,
    tabCompleted: tabCompleted as (
      tab: string,
      entity: TIntegrationListing | TListing | TCompany,
    ) => boolean,
    handleRedirect: handleRedirectOnSwitchTab,
  });

  useEffect(() => {
    return () => {
      dispatch(PartnerManageMenusActions.clearLoadedMenuData());
    };
  }, [dispatch]);

  useEffect(() => {
    if (restaurantId && router.query.restaurantId !== restaurantId) {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            restaurantId,
          },
        },
        undefined,
        { shallow: true },
      );
    }
  }, [restaurantId, router]);

  useEffect(() => {
    setSubmittedValues(null);
  }, [tab]);

  useEffect(() => {
    if (!menuId || !restaurantId) return;
    dispatch(
      PartnerManageMenusThunks.loadMenuData({ menuId: menuId as string }),
    );
  }, [dispatch, menuId, restaurantId]);

  useEffect(() => {
    if (!menuId) return;

    dispatch(
      PartnerManageMenusThunks.loadMenuData({ menuId: menuId as string }),
    );
  }, [dispatch, menuId]);

  useEffect(() => {
    dispatch(PartnerManageMenusActions.clearCreateOrUpdateMenuError());
  }, [dispatch, tab]);

  const createOrUpdateMenuInProgress =
    createDraftMenuInProgress ||
    updateDraftMenuInProgress ||
    publishDraftMenuInProgress;

  const createOrUpdateMenuError =
    createDraftMenuError || updateDraftMenuError || publishDraftMenuError;

  const handleSubmit = () => {
    if (formRef.current) formRef.current?.submit();
  };

  if (loadMenuDataInProgress) {
    return <LoadingContainer />;
  }

  if (!restaurantId) {
    return null;
  }

  const submitReady = isEqual(
    submittedValues,
    formRef.current?.getState().values,
  );

  const handleGoBack = () => {
    const tabIndex = EDIT_PARTNER_MENU_TABS.findIndex((cur) => cur === tab);
    const prevTab = EDIT_PARTNER_MENU_TABS[tabIndex - 1];
    router.push({
      pathname: !menuId
        ? partnerPaths.CreateMenu
        : partnerPaths.EditMenu.replace('[menuId]', menuId as string),
      query: {
        tab: prevTab,
        menuId,
      },
    });
  };

  const isDraft =
    !currentMenu ||
    IntegrationMenuListing(currentMenu as TIntegrationListing).getMetadata()
      .listingState === EListingStates.draft;

  return (
    <div>
      <h2 className={css.title}>
        <FormattedMessage
          id={
            menuId && !isDraft
              ? 'EditPartnerMenuPage.title'
              : 'CreatePartnerMenuPage.title'
          }
        />
      </h2>
      <FormWizard formTabNavClassName={css.formTabNav}>
        {EDIT_PARTNER_MENU_TABS.map((menuTab: string, index: number) => {
          const disabled = !tabCompleted(
            EDIT_PARTNER_MENU_TABS[index - 1],
            currentMenu as TIntegrationListing,
          );

          return (
            <PartnerMenuTab
              key={menuTab}
              tab={menuTab}
              tabId={menuTab}
              selected={selectedTab === menuTab}
              tabLabel={intl.formatMessage({
                id: `EditPartnerMenuWizard.${menuTab}Label`,
              })}
              tabLinkProps={tabLink(menuTab)}
              disabled={disabled}
              formRef={formRef}
              menuId={menuId as string}
              restaurantId={restaurantId}
              currentMenu={currentMenu}
              setSubmittedValues={setSubmittedValues}
            />
          );
        })}
      </FormWizard>
      {createOrUpdateMenuError && (
        <ErrorMessage message={createOrUpdateMenuError.message} />
      )}
      <div
        className={classNames(css.navigateButtons, {
          [css.flexEnd]: tab === MENU_INFORMATION_TAB,
        })}>
        {tab !== MENU_INFORMATION_TAB && (
          <Button
            variant="secondary"
            disabled={createOrUpdateMenuInProgress}
            onClick={handleGoBack}>
            <FormattedMessage id="EditPartnerMenuWizard.back" />
          </Button>
        )}
        <Button
          inProgress={createOrUpdateMenuInProgress}
          disabled={createOrUpdateMenuInProgress}
          onClick={handleSubmit}
          ready={submitReady}>
          <FormattedMessage
            id={
              tab !== MENU_COMPLETE_TAB
                ? 'EditPartnerMenuWizard.next'
                : 'EditPartnerMenuWizard.complete'
            }
          />
        </Button>
      </div>
    </div>
  );
};

export default PartnerMenuWizard;
