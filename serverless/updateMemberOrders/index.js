const {
  queryAllCollectionData,
  updateCollectionDoc,
} = require('./services/firebase/helper');
const { denormalisedResponseEntities, Listing } = require('./utils/data');
const { getIntegrationSdk } = require('./utils/sdk');
require('dotenv').config();

const { FIREBASE_MEMBER_ORDERS_COLLECTION_NAME } = process.env;

const EOrderStates = {
  canceled: 'canceled',
  canceledByBooker: 'canceledByBooker',
  picking: 'picking',
  inProgress: 'inProgress',
  pendingPayment: 'pendingPayment',
  completed: 'completed',
  reviewed: 'reviewed',
  expiredStart: 'expiredStart',
};

exports.handler = async () => {
  const integrationSdk = getIntegrationSdk();
  try {
    const orderMembers = await queryAllCollectionData({
      collectionName: FIREBASE_MEMBER_ORDERS_COLLECTION_NAME,
      queryParams: {
        status: {
          operator: '==',
          value: 'pending',
        },
      },
      order: {
        field: 'createdAt',
        direction: 'asc', // get all order members with ascending createdAt
      },
    });
    console.log('orderMembers', orderMembers);
    // group order members by planId
    const groupOrders = orderMembers.reduce((acc, orderMember) => {
      acc[orderMember.planId] = {
        ...acc[orderMember.planId],
        [orderMember.participantId]: orderMember.planData, // get the latest plan data
      };

      return acc;
    }, {});
    const updateOrderDetails = await Promise.allSettled(
      // restructute memberOrders to plan listing order detail
      Object.entries(groupOrders).map(async ([planId, memberOrders]) => {
        const planListingResponse = await integrationSdk.listings.show({
          id: planId,
        });
        const [planListing] = denormalisedResponseEntities(planListingResponse);
        const { orderDetail, orderId } = Listing(planListing).getMetadata();
        if (!orderId) {
          console.error('Update member orders failed', 'Order ID is required');

          return;
        }
        const orderListingResponse = await integrationSdk.listings.show({
          id: orderId,
        });
        const [orderListing] =
          denormalisedResponseEntities(orderListingResponse);

        const { orderState } = Listing(orderListing).getMetadata();
        // if order state is not in progress or picking, cancel all pending member orders
        if (
          orderState !== EOrderStates.inProgress &&
          orderState !== EOrderStates.picking
        ) {
          const memberOrdersWithPendingStatus = orderMembers.filter(
            (orderMember) =>
              orderMember.planId === planId && orderMember.orderId === orderId,
          );

          // cancel all pending member orders
          await Promise.allSettled(
            memberOrdersWithPendingStatus.map(async (orderMember) => {
              await updateCollectionDoc(
                orderMember.id,
                { status: 'canceled' },
                FIREBASE_MEMBER_ORDERS_COLLECTION_NAME,
              );
            }),
          );
          console.error(
            'Update member orders failed',
            'Order state is not in progress or picking',
          );

          return;
        }

        const orderDays = Object.keys(orderDetail);
        const newOrderDetail = orderDays.reduce((acc, orderDay) => {
          acc[orderDay] = {
            ...orderDetail[orderDay],
            memberOrders: {
              ...orderDetail[orderDay].memberOrders,
              ...Object.values(memberOrders).reduce(
                (newMemberOrders, memberOrder) => {
                  const memberOrderData = memberOrder[orderDay];
                  const participantId = Object.keys(memberOrderData);
                  const memberMeal = Object.values(memberOrderData)[0];
                  newMemberOrders[participantId] = memberMeal;

                  return newMemberOrders;
                },
                {},
              ),
            },
          };

          return acc;
        }, {});
        // update plan listing order detail
        await integrationSdk.listings.update({
          id: planId,
          metadata: { orderDetail: newOrderDetail },
        });
        const orderMemberRecordsInPlan = orderMembers.filter(
          (orderMember) => orderMember.planId === planId,
        );
        // update order member status to completed
        await Promise.allSettled(
          orderMemberRecordsInPlan.map(async (orderMember) => {
            const documentId = orderMember.id;
            await updateCollectionDoc(
              documentId,
              {
                status: 'completed',
              },
              FIREBASE_MEMBER_ORDERS_COLLECTION_NAME,
            );
          }),
        );
      }),
    );

    console.info('Update member orders successfully', updateOrderDetails);
  } catch (error) {
    console.error('Update member orders failed', error);
    throw error;
  }
};
