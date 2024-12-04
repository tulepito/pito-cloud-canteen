const isEmpty = require('lodash/isEmpty');
const get = require('lodash/get');
const uniq = require('lodash/uniq');
const { denormalisedResponseEntities, Listing } = require('./utils/data');
const {
  EOrderType,
  EParticipantOrderStatus,
  ORDER_STATES,
} = require('./utils/enums');
const {
  fetchListingsByChunkedIds,
  fetchUserByChunkedIds,
} = require('./utils/api');
const {
  getFoodIdListWithSuitablePrice,
} = require('./services/getFoodIdListWithSuitablePrice');
const { recommendFood } = require('./services/recommendFood');
const getIntegrationSdk = require('./utils/integrationSdk');
const createParticipantSubOrderFirebase = require('./services/createParticipantSubOrderFirebase');
const sendEmailToParticipants = require('./services/sendEmailToParticipants');
const sendNativeNotificationToParticipants = require('./services/sendNativeNotificationToParticipants');

exports.handler = async (_event) => {
  try {
    console.log('Start to run schedule to pick food for empty members...');
    console.log('_event: ', _event);
    const { orderId } = _event;

    if (isEmpty(orderId)) {
      console.error('Missing orderId');

      return;
    }

    const integrationSdk = getIntegrationSdk();

    const orderResponse = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: orderId,
      }),
    )[0];

    console.info('💫 > orderListing: ');
    console.info(orderResponse);

    const { orderState, orderType } = Listing(orderResponse).getMetadata();

    if (orderType !== EOrderType.group) {
      console.error('Cannot pick food for non-group order');

      return;
    }

    if (orderState !== ORDER_STATES.picking) {
      console.error('💫 > Cannot pick for non-picking order');

      return;
    }

    const planId = get(orderResponse, 'attributes.metadata.plans[0]', '');
    const planResponse = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    )[0];
    const orderDetail = get(
      planResponse,
      'attributes.metadata.orderDetail',
      {},
    );

    const {
      memberIds: allEmptyMembersIds,
      foodIds: allFoodIds,
      restaurantIds: allRestaurantIds,
      groupFoodIdsBySubOrder,
    } = Object.keys(orderDetail).reduce(
      (result, subOrderDate) => {
        const { memberIds, foodIds, restaurantIds } = result;
        const subOrder = orderDetail[subOrderDate];
        const memberOrders = get(subOrder, 'memberOrders', {});

        const emptyMembers = Object.keys(memberOrders).reduce(
          (emptyMembersResult, memberId) => {
            const memberOrder = memberOrders[memberId];

            if (memberOrder.status === EParticipantOrderStatus.empty) {
              return [...emptyMembersResult, memberId];
            }

            return emptyMembersResult;
          },
          [],
        );

        const suitablePriceFoodList = getFoodIdListWithSuitablePrice(
          subOrderDate,
          orderResponse,
          planResponse,
        );

        const newResult = {
          memberIds: uniq([...memberIds, ...emptyMembers]),
          foodIds: uniq([...foodIds, ...suitablePriceFoodList]),
          restaurantIds: uniq([...restaurantIds, subOrder?.restaurant?.id]),
          groupFoodIdsBySubOrder: {
            ...result.groupFoodIdsBySubOrder,
            [subOrderDate]: {
              memberIds: emptyMembers,
              foodIds: suitablePriceFoodList,
            },
          },
        };

        return newResult;
      },
      {
        memberIds: [],
        foodIds: [],
        restaurantIds: [],
        groupFoodIdsBySubOrder: {},
      },
    );

    const memberResponses = await fetchUserByChunkedIds(
      allEmptyMembersIds,
      integrationSdk,
    );

    const foodResponses = await fetchListingsByChunkedIds(
      allFoodIds,
      integrationSdk,
      {
        include: ['images'],
        'fields.image': ['variants.square-small2x'],
      },
    );
    console.log('foodResponses: ', JSON.stringify(foodResponses));
    const restaurantResponses = await fetchListingsByChunkedIds(
      allRestaurantIds,
      integrationSdk,
      {
        include: ['images'],
        'fields.image': ['variants.square-small2x'],
      },
    );

    const newOrderDetail = Object.keys(orderDetail).reduce(
      (result, subOrderDate) => {
        const subOrder = orderDetail[subOrderDate];

        const memberOrders = get(subOrder, 'memberOrders', {});

        const newMemberOrder = Object.keys(memberOrders).reduce(
          (newMemberOrderResult, memberId) => {
            if (
              memberOrders[memberId].status !== EParticipantOrderStatus.empty
            ) {
              newMemberOrderResult[memberId] = memberOrders[memberId];

              return newMemberOrderResult;
            }

            const memberResponse = memberResponses.find(
              (member) => member.id.uuid === memberId,
            );
            const allergies = get(
              memberResponse,
              'attributes.publicData.allergies',
              [],
            );
            const suitableFood = recommendFood(
              foodResponses,
              groupFoodIdsBySubOrder[subOrderDate].foodIds,
              allergies,
            );

            newMemberOrderResult[memberId] = {
              ...newMemberOrderResult[memberId],
              foodId: suitableFood.id.uuid,
              status: EParticipantOrderStatus.joined,
            };

            console.log(`Pick food for user`, memberId, suitableFood.id.uuid);

            return newMemberOrderResult;
          },
          {},
        );

        result[subOrderDate] = {
          ...subOrder,
          memberOrders: newMemberOrder,
        };

        return result;
      },
      {},
    );

    await integrationSdk.listings.update({
      id: planId,
      metadata: {
        orderDetail: newOrderDetail,
      },
    });
    console.info('Update order detail successfully');

    const handlingCreateParticipantSubOrderFirebase =
      createParticipantSubOrderFirebase({
        groupFoodIdsBySubOrder,
        newOrderDetail,
        restaurantResponses,
        foodResponses,
        orderResponse,
        planResponse,
      });

    const handlingSendEmailToParticipants = sendEmailToParticipants({
      groupFoodIdsBySubOrder,
      allEmptyMembersIds,
      participantResponses: memberResponses,
      orderResponse,
      newOrderDetail,
    });
    const handlingSendNativeNotificationToParticipants =
      sendNativeNotificationToParticipants({
        allEmptyMembersIds,
        participantResponses: memberResponses,
        orderResponse,
        planResponse,
      });

    await Promise.allSettled([
      handlingCreateParticipantSubOrderFirebase,
      handlingSendEmailToParticipants,
      handlingSendNativeNotificationToParticipants,
    ]);

    console.info('Schedule to pick food for empty members successfully');
  } catch (error) {
    console.error('Schedule to pick food for empty members error');

    if (error.status && error.statusText && error.data) {
      const { status, statusText, data } = error;

      console.error({
        name: 'Local API request failed',
        status,
        statusText,
      });
      console.error(data);
    } else {
      console.error(error?.message);
    }
  }
};
