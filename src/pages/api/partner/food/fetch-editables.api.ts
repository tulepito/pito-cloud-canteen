import { uniqBy } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

import { DAY_IN_WEEK } from '@components/CalendarDashboard/helpers/constant';
import { fetchListingsByChunkedIds } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import {
  denormalisedResponseEntities,
  IntegrationListing,
  Listing,
} from '@src/utils/data';
import { EListingType, EOrderStates } from '@src/utils/enums';
import type { TIntegrationListing, TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const integrationSdk = getIntegrationSdk();
    const { foodIds = [] } = req.body;

    if (!Array.isArray(foodIds) || foodIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'foodIds must be a non-empty array' });
    }

    // Step 1: Query menus that contain any of the foodIds using OR query
    // But we need to track which food is in which menu
    const menuFoodMap: Record<string, Set<string>> = {};
    const allMenus: TIntegrationListing[] = [];

    await Promise.all(
      DAY_IN_WEEK.map(async (weekday) => {
        const dayKey = weekday.slice(0, 3); // mon, tue, wed, etc.
        const response = await integrationSdk.listings.query({
          meta_listingType: EListingType.menu,
          [`meta_${dayKey}FoodIdList`]: `has_any:${foodIds.join(',')}`,
          meta_isDeleted: false,
        });

        const menus = denormalisedResponseEntities(response);
        allMenus.push(...menus);

        // For each menu, check which foodIds are actually in it
        menus.forEach((menu: TIntegrationListing) => {
          const menuListing = IntegrationListing(menu);
          const menuId = menu.id.uuid;
          const foodIdList =
            menuListing.getMetadata()[`${dayKey}FoodIdList`] || [];

          if (!menuFoodMap[menuId]) {
            menuFoodMap[menuId] = new Set();
          }

          // Track which foods from our input are actually in this menu
          foodIds.forEach((foodId) => {
            if (foodIdList.includes(foodId)) {
              menuFoodMap[menuId].add(foodId);
            }
          });
        });
      }),
    );

    // Deduplicate menus
    const uniqueMenus = uniqBy(allMenus, 'id.uuid');
    const menuIds: string[] = uniqueMenus.map(
      (menu: TIntegrationListing) => menu.id.uuid,
    );

    // Initialize editable map - all foods are editable by default
    const editableMap: Record<string, boolean> = {};
    foodIds.forEach((foodId) => {
      editableMap[foodId] = true;
    });

    // If no menus found, all foods are editable
    if (menuIds.length === 0) {
      return res.json({
        items: foodIds.map((foodId) => ({
          foodId,
          isEditable: true,
        })),
      });
    }

    // Step 2: Query subOrders (plans) that use these menus
    const plans = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_listingType: EListingType.subOrder,
        meta_menuIds: `has_any:${menuIds.join(',')}`,
      }),
    );

    if (plans.length === 0) {
      return res.json({
        items: foodIds.map((foodId) => ({
          foodId,
          isEditable: true,
        })),
      });
    }

    // Step 3: Get orderIds from plans and query all orders (chunk if needed)
    const orderIds: string[] = uniqBy(
      plans
        .map((plan: TListing) => Listing(plan).getMetadata().orderId)
        .filter((id: string): id is string => typeof id === 'string'),
      (id) => id,
    );

    if (orderIds.length === 0) {
      return res.json({
        items: foodIds.map((foodId) => ({
          foodId,
          isEditable: true,
        })),
      });
    }

    // Query all orders in chunks (no 100 limit)
    const orders = await fetchListingsByChunkedIds(orderIds, integrationSdk);

    // Filter orders by active states
    const activeOrders = orders.filter((order: TIntegrationListing) => {
      const orderListing = IntegrationListing(order);
      const orderState = orderListing.getMetadata().orderState;

      return [
        EOrderStates.picking,
        EOrderStates.inProgress,
        EOrderStates.pendingPayment,
        EOrderStates.completed,
      ].includes(orderState);
    });

    if (activeOrders.length === 0) {
      return res.json({
        items: foodIds.map((foodId) => ({
          foodId,
          isEditable: true,
        })),
      });
    }

    // Step 4: Build plan-food mapping to track which foods are in which orders
    const planFoodMap: Record<string, Set<string>> = {};
    plans.forEach((plan: TListing) => {
      const planListing = Listing(plan);
      const planMenuIds = planListing.getMetadata().menuIds || [];
      const planId = plan.id.uuid;

      if (!planFoodMap[planId]) {
        planFoodMap[planId] = new Set();
      }

      // For each menu in this plan, get the foods that are locked
      planMenuIds.forEach((menuId: string) => {
        if (menuFoodMap[menuId]) {
          menuFoodMap[menuId].forEach((foodId) => {
            planFoodMap[planId].add(foodId);
          });
        }
      });
    });

    // Step 5: Map orders to plans and mark foods as non-editable
    const activeOrderIds = new Set(
      activeOrders.map((order: TIntegrationListing) => order.id.uuid),
    );

    plans.forEach((plan: TListing) => {
      const planListing = Listing(plan);
      const orderId = planListing.getMetadata().orderId;

      if (orderId && activeOrderIds.has(orderId)) {
        // This plan's order is active, so all foods in this plan are locked
        const lockedFoods = planFoodMap[plan.id.uuid];
        if (lockedFoods) {
          lockedFoods.forEach((foodId) => {
            editableMap[foodId] = false;
          });
        }
      }
    });

    // Return results
    return res.json({
      items: foodIds.map((foodId) => ({
        foodId,
        isEditable: editableMap[foodId] ?? true,
      })),
    });
  } catch (error) {
    console.error('SERVER fetch-editable-batch error:', error);
    handleError(res, error);
  }
}

export default cookies(handler);
