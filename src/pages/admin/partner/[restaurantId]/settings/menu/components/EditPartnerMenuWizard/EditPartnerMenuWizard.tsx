/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import type { TFormTabChildrenProps } from '@components/FormWizard/FormTabs/FormTabs';
import FormWizard from '@components/FormWizard/FormWizard';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useRedirectTabWizard from '@hooks/useRedirectTabWizard';
import { menusSliceAction, menusSliceThunks } from '@redux/slices/menus.slice';
import { adminRoutes } from '@src/paths';
import { IntegrationMenuListing } from '@utils/data';
import { EListingStates, EMenuMealType, EMenuTypes } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';
import classNames from 'classnames';
import type { FormApi } from 'final-form';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import EditMenuCompleteForm from '../EditMenuCompleteForm/EditMenuCompleteForm';
import EditMenuInformationForm from '../EditMenuInformationForm/EditMenuInformationForm';
import EditMenuPricingForm from '../EditMenuPricingForm/EditMenuPricingForm';
import css from './EditPartnerMenuWizard.module.scss';
import useQueryMenuPickedFoods from './useQueryMenuPickedFoods';
import type { TEditMenuFormValues } from './utils';
import {
  createDuplicateSubmitMenuValues,
  createSubmitMenuValues,
  EDIT_PARTNER_MENU_TABS,
  MENU_COMPLETE_TAB,
  MENU_INFORMATION_TAB,
  MENU_PRICING_TAB,
  renderValuesForFoodsByDate,
} from './utils';

export type TFormRefObject = React.MutableRefObject<
  FormApi<Record<string, any>, Partial<Record<string, any>>> | undefined
>;

type TEditPartnerMenuTabProps = {
  tab: string;
  formRef: any;
  menuId?: string;
  restaurantId: string;
  currentMenu?: TIntegrationListing | null;
  duplicateId?: string;
  setSubmittedValues: (e: any) => void;
} & TFormTabChildrenProps;

const redirectAfterDraftUpdate = (
  restaurantId: string,
  id: string,
  tab: string,
  tabs: string[],
  router: any,
  pathname: string,
) => {
  const tabIndex = tabs.findIndex((cur) => cur === tab);
  const nextTab = tabs[tabIndex + 1];
  return router.push(
    `${pathname}/${restaurantId}/settings/menu/${id}/?tab=${nextTab}`,
  );
};

const EditPartnerMenuTab: React.FC<TEditPartnerMenuTabProps> = (props) => {
  const {
    tab,
    formRef,
    restaurantId,
    currentMenu,
    menuId,
    duplicateId,
    setSubmittedValues,
  } = props;
  const router = useRouter();

  const dispatch = useAppDispatch();

  const onSubmit = async (values: any) => {
    const submitValues = !duplicateId
      ? createSubmitMenuValues({ ...values, restaurantId }, tab, currentMenu)
      : createDuplicateSubmitMenuValues(
          { ...values, restaurantId },
          currentMenu as TIntegrationListing,
          tab,
        );

    setSubmittedValues(null);

    const { payload: listing, error } = menuId
      ? ((await dispatch(
          menusSliceThunks.updatePartnerMenuListing({
            ...submitValues,
            id: menuId,
          }),
        )) as any)
      : ((await dispatch(
          menusSliceThunks.createPartnerMenuListing(submitValues),
        )) as any);

    const isDraft =
      IntegrationMenuListing(listing).getMetadata().listingState ===
      EListingStates.draft;

    !isDraft && !error && setSubmittedValues(values);

    if (isDraft && !error) {
      return redirectAfterDraftUpdate(
        restaurantId,
        listing?.id?.uuid,
        tab,
        EDIT_PARTNER_MENU_TABS,
        router,
        adminRoutes.ManagePartners.path,
      );
    }
  };

  const { title } = IntegrationMenuListing(currentMenu).getAttributes();
  const { menuType } = IntegrationMenuListing(currentMenu).getMetadata();
  const { mealType, startDate, daysOfWeek, numberOfCycles, foodsByDate } =
    IntegrationMenuListing(currentMenu).getPublicData();

  const idsToQuery = IntegrationMenuListing(currentMenu).getListFoodIds();

  const { menuPickedFoods } = useQueryMenuPickedFoods({
    restaurantId: restaurantId as string,
    ids: idsToQuery,
  });

  const foodByDateToRender = renderValuesForFoodsByDate(
    foodsByDate,
    menuPickedFoods,
  );

  const initialValues = useMemo(() => {
    switch (tab) {
      case MENU_INFORMATION_TAB:
        return currentMenu
          ? {
              title,
              menuType,
              mealType,
              startDate,
              daysOfWeek,
              numberOfCycles,
            }
          : {
              menuType: EMenuTypes.fixedMenu,
              mealType: EMenuMealType.breakfast,
            };
      case MENU_PRICING_TAB: {
        return currentMenu
          ? {
              foodsByDate: foodByDateToRender,
            }
          : {};
      }
      default:
        break;
    }
  }, [
    JSON.stringify(currentMenu),
    JSON.stringify(menuPickedFoods),
  ]) as TEditMenuFormValues;

  switch (tab) {
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
          formRef={formRef}
          initialValues={initialValues}
          onSubmit={onSubmit}
          currentMenu={currentMenu as TIntegrationListing}
          restaurantId={restaurantId}
        />
      );
    }

    case MENU_COMPLETE_TAB: {
      return (
        <EditMenuCompleteForm
          onSubmit={onSubmit}
          formRef={formRef}
          initialValues={initialValues}
          currentMenu={currentMenu}
          restaurantId={restaurantId}
        />
      );
    }

    default:
      return <></>;
  }
};

const tabCompleted = (tab: string, listing: TIntegrationListing) => {
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

const EditPartnerMenuWizard = () => {
  const router = useRouter();
  const { query, pathname } = router;
  const formRef = useRef<FormApi>();
  const [submittedValues, setSubmittedValues] = useState<any>();
  const intl = useIntl();
  const {
    tab = MENU_INFORMATION_TAB,
    menuId,
    restaurantId,
    duplicateId,
  } = query;
  const selectedTab = tab || MENU_INFORMATION_TAB;
  const tabLink = (tab: string) => {
    return {
      path: !menuId
        ? duplicateId
          ? `/admin/partner/${restaurantId}/settings/menu/create`
          : pathname
        : `/admin/partner/${restaurantId}/settings/menu/${menuId}`,
      to: {
        search: !duplicateId
          ? `tab=${tab}`
          : `tab=${tab}&duplicateId=${duplicateId}`,
      },
    };
  };

  const dispatch = useAppDispatch();
  const currentMenu = useAppSelector(
    (state) => state.menus.currentMenu,
    shallowEqual,
  );

  const showCurrentMenuInProgress = useAppSelector(
    (state) => state.menus.showCurrentMenuInProgress,
    shallowEqual,
  );

  const isNew =
    !currentMenu ||
    (currentMenu &&
      currentMenu?.attributes?.metadata?.listingState === EListingStates.draft);

  const handleRedirectOnSwitchTab = (nearestActiveTab: string) => {
    !currentMenu
      ? router.push(
          `/admin/partner/${restaurantId}/settings/menu/create?tab=${nearestActiveTab}`,
        )
      : router.push(
          `/admin/partner/${restaurantId}/settings/menu/${menuId}?tab=${nearestActiveTab}`,
        );
  };

  useRedirectTabWizard({
    isNew,
    entity: currentMenu as TIntegrationListing,
    selectedTab: tab as string,
    tabs: EDIT_PARTNER_MENU_TABS,
    tabCompleted,
    handleRedirect: handleRedirectOnSwitchTab,
  });

  useEffect(() => {
    setSubmittedValues(null);
  }, [tab]);

  useEffect(() => {
    if (!menuId) return;
    dispatch(menusSliceThunks.showPartnerMenuListing(menuId));
  }, [dispatch, menuId]);

  useEffect(() => {
    dispatch(menusSliceAction.clearCreateOrUpdateMenuError());
  }, [tab]);

  useEffect(() => {
    if (!duplicateId || menuId) return;
    dispatch(menusSliceThunks.showPartnerMenuListing(duplicateId));
  }, [duplicateId, menuId, dispatch]);

  const createOrUpdateMenuInProgress = useAppSelector(
    (state) => state.menus.createOrUpdateMenuInProgress,
    shallowEqual,
  );

  const createOrUpdateMenuError = useAppSelector(
    (state) => state.menus.createOrUpdateMenuError,
    shallowEqual,
  );

  const handleSubmit = () => {
    if (formRef.current) formRef.current?.submit();
  };

  if (showCurrentMenuInProgress) {
    return <LoadingContainer />;
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
        ? adminRoutes.CreatePartnerMenu.path
        : adminRoutes.EditPartnerMenu.path,
      query: {
        tab: prevTab,
        restaurantId,
        menuId,
      },
    });
  };

  const isDraft =
    currentMenu &&
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
            <EditPartnerMenuTab
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
              restaurantId={restaurantId as string}
              currentMenu={currentMenu}
              duplicateId={duplicateId as string}
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

export default EditPartnerMenuWizard;
