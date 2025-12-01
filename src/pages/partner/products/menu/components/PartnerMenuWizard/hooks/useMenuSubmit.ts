import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  type TEditMenuFormValues,
  createSubmitMenuValues,
  EDIT_PARTNER_MENU_TABS,
  MENU_COMPLETE_TAB,
  MENU_PRICING_TAB,
} from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditPartnerMenuWizard/utils';
import { partnerPaths } from '@src/paths';
import { IntegrationMenuListing } from '@src/utils/data';
import { EListingStates } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';

import {
  PartnerManageMenusActions,
  PartnerManageMenusThunks,
} from '../../../PartnerManageMenus.slice';
import { buildDraftMenuPayload } from '../utils';

type TUseMenuSubmitProps = {
  activeTab: string;
  menuId?: string;
  restaurantId: string;
  currentMenu?: TIntegrationListing | null;
};

/**
 * Redirect to next tab after draft update
 */
const redirectAfterDraftUpdate = (
  id: string,
  tab: string,
  tabs: string[],
  router: NextRouter,
) => {
  const tabIndex = tabs.findIndex((cur) => cur === tab);
  const nextTab = tabs[tabIndex + 1];

  return router.push(
    `${partnerPaths.EditMenu.replace('[menuId]', id)}?tab=${nextTab}`,
  );
};

/**
 * Custom hook to handle menu submit logic
 * Handles create, update, and publish operations
 */
export const useMenuSubmit = ({
  activeTab,
  menuId,
  restaurantId,
}: TUseMenuSubmitProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draftMenu = useAppSelector(
    (state) => state.PartnerManageMenus.draftMenu,
  );

  const handleSubmit = async (
    values: TEditMenuFormValues,
    setSubmittedValues: (values: TEditMenuFormValues | null) => void,
  ): Promise<void> => {
    // Prepare submit values based on tab and mode
    const submitValues = createSubmitMenuValues(
      { ...values, restaurantId },
      activeTab,
    );
    // Build draft menu payload
    const draftMenuData = buildDraftMenuPayload({
      submitValues,
      draftMenu,
    });
    // Save draft to Redux
    dispatch(PartnerManageMenusActions.saveDraft(draftMenuData));

    let listing: TIntegrationListing | null = null;
    let error: { requestStatus: string; error?: unknown } | null = null;

    // Handle update existing menu
    if (menuId) {
      const { meta, payload } = await dispatch(
        PartnerManageMenusThunks.updateDraftMenu({
          isDraftEditFlow: true,
        }),
      );
      if (meta.requestStatus === 'fulfilled') {
        listing = payload;
        setSubmittedValues(null);
      } else {
        error = meta;
      }
    }
    // Handle create new menu
    else {
      const { meta, payload } = await dispatch(
        PartnerManageMenusThunks.createDraftMenu(),
      );
      if (meta.requestStatus === 'fulfilled') {
        listing = payload;
        router.replace(
          `${partnerPaths.EditMenu.replace(
            '[menuId]',
            payload.id.uuid,
          )}?tab=${MENU_PRICING_TAB}`,
        );
      } else {
        error = meta;
      }
    }

    // If error, stop here
    if (!listing && error) {
      return;
    }

    // Handle post-submit actions
    if (listing) {
      const listingState =
        IntegrationMenuListing(listing).getMetadata().listingState;
      const isDraft = listingState === EListingStates.draft;

      if (!isDraft && !error) {
        setSubmittedValues(values);
      }

      // Publish menu if on complete tab
      if (activeTab === MENU_COMPLETE_TAB && !error) {
        const { meta: publishMeta } = await dispatch(
          PartnerManageMenusThunks.publishDraftMenu(),
        );
        if (publishMeta.requestStatus === 'fulfilled') {
          router.push(partnerPaths.ManageMenus);

          return;
        }
      }

      // Redirect to next tab for draft
      if (!error) {
        await redirectAfterDraftUpdate(
          listing?.id?.uuid,
          activeTab,
          EDIT_PARTNER_MENU_TABS,
          router,
        );
      }
    }
  };

  return { handleSubmit };
};
