/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import type { TFormTabChildrenProps } from '@components/FormWizard/FormTabs/FormTabs';
import FormWizard from '@components/FormWizard/FormWizard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import { adminRoutes } from '@src/paths';
import { INTERGRATION_LISTING, LISTING } from '@utils/data';
import { EListingStates, EMenuTypes } from '@utils/enums';
import type { TIntergrationListing } from '@utils/types';
import type { FormApi } from 'final-form';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import EditMenuCompleteForm from '../EditMenuCompleteForm/EditMenuCompleteForm';
import EditMenuInformationForm from '../EditMenuInformationForm/EditMenuInformationForm';
import EditMenuPricingForm from '../EditMenuPricingForm/EditMenuPricingForm';
import css from './EditPartnerMenuWizard.module.scss';
import type { TEditMenuFormValues } from './utils';
import {
  createSubmitMenuValues,
  EDIT_PARTNER_MENU_TABS,
  MENU_COMPLETE_TAB,
  MENU_INFORMATION_TAB,
  MENU_PRICING_TAB,
} from './utils';

export type TFormRefObject = React.MutableRefObject<
  FormApi<Record<string, any>, Partial<Record<string, any>>> | undefined
>;

type TEditPartnerMenuTabProps = {
  tab: string;
  formRef: any;
  menuId?: string;
  restaurantId: string;
  currentMenu?: TIntergrationListing | null;
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
  const { tab, formRef, restaurantId, currentMenu, menuId } = props;
  const router = useRouter();

  const dispatch = useAppDispatch();

  const onSubmit = async (values: any) => {
    const submitValues = createSubmitMenuValues(
      { ...values, restaurantId },
      tab,
    );
    const { payload: listing } = menuId
      ? await dispatch(
          menusSliceThunks.updatePartnerMenuListing({
            ...submitValues,
            id: menuId,
          }),
        )
      : await dispatch(menusSliceThunks.createPartnerMenuListing(submitValues));

    const isDraft =
      LISTING(listing).getMetadata().listingState === EListingStates.draft;

    if (isDraft) {
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

  const initialValues = useMemo(() => {
    const { title } = INTERGRATION_LISTING(currentMenu).getAttributes();
    const { menuType } = INTERGRATION_LISTING(currentMenu).getMetadata();
    const { mealTypes, startDate, daysOfWeek, numberOfCycles, foodsByDate } =
      INTERGRATION_LISTING(currentMenu).getPublicData();

    switch (tab) {
      case MENU_INFORMATION_TAB:
        return currentMenu
          ? {
              title,
              menuType,
              mealTypes,
              startDate,
              daysOfWeek,
              numberOfCycles,
            }
          : {
              menuType: EMenuTypes.fixedMenu,
            };
      case MENU_PRICING_TAB:
        return currentMenu
          ? {
              foodsByDate,
            }
          : {};
      default:
        break;
    }
  }, [JSON.stringify(currentMenu)]) as TEditMenuFormValues;

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
          currentMenu={currentMenu as TIntergrationListing}
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
        />
      );
    }

    default:
      return <></>;
  }
};

const tabCompleted = (tab: string, listing: any) => {
  const {
    mealTypes = [],
    startDate,
    daysOfWeek = [],
  } = LISTING(listing).getPublicData();
  const { menuType } = LISTING(listing).getMetadata();

  const informationTabCompleted = !!(
    menuType &&
    mealTypes.length > 0 &&
    startDate &&
    daysOfWeek.length > 0
  );

  switch (tab) {
    case MENU_INFORMATION_TAB:
      return informationTabCompleted;
    case MENU_PRICING_TAB:
      return true;
    case MENU_COMPLETE_TAB:
      return true;
    default:
      return false;
  }
};

const EditPartnerMenuWizard = () => {
  const router = useRouter();
  const { query, pathname } = router;
  const formRef = useRef<FormApi>();
  const intl = useIntl();
  const { tab, menuId, restaurantId } = query;
  const selectedTab = tab || MENU_INFORMATION_TAB;
  const tabLink = (tab: string) => {
    return {
      path: !menuId
        ? pathname
        : `/admin/partner/${restaurantId}/settings/menu/${menuId}`,
      to: { search: `tab=${tab}` },
    };
  };

  const dispatch = useAppDispatch();
  const currentMenu = useAppSelector(
    (state) => state.menus.currentMenu,
    shallowEqual,
  );

  useEffect(() => {
    if (!menuId || !!currentMenu) return;
    dispatch(menusSliceThunks.showPartnerMenuListing(menuId));
  }, [dispatch, menuId, currentMenu]);

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

  return (
    <div>
      <FormWizard formTabNavClassName={css.formTabNav}>
        {EDIT_PARTNER_MENU_TABS.map((menuTab: string, index: number) => {
          const disabled = !tabCompleted(
            EDIT_PARTNER_MENU_TABS[index - 1],
            currentMenu,
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
            />
          );
        })}
      </FormWizard>
      {createOrUpdateMenuError && (
        <ErrorMessage message={createOrUpdateMenuError.message} />
      )}
      <div className={css.navigateButtons}>
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
          onClick={handleSubmit}>
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
