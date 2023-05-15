import { getListingImageById } from '@pages/company/booker/orders/draft/[orderId]/restaurants/helpers';
import {
  setCollectionDocWithCustomId,
  updateCollectionDoc,
} from '@services/firebase';
import { fetchListing } from '@services/integrationHelper';
import { Listing } from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';

const { FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME } = process.env;

export const addFirebaseDocument = async ({
  participantId,
  planId,
  timestamp,
}: {
  participantId: string;
  planId: string;
  timestamp: number;
}) => {
  const plan = await fetchListing(planId);
  const planListing = Listing(plan);
  const { orderId, orderDetail = {} } = planListing.getMetadata();
  const order = await fetchListing(orderId);
  const orderListing = Listing(order);
  const { deliveryHour } = orderListing.getMetadata();
  const subOrder = orderDetail[timestamp];
  const { memberOrders = {}, transactionId, restaurant = {} } = subOrder;
  const { id: restaurantId, restaurantName, foodList } = restaurant;
  const { foodId, status } = memberOrders[participantId];
  const { foodName } = foodList[foodId];

  const restaurantResponse = await fetchListing(
    restaurantId,
    ['images'],
    [`variants.${EImageVariants.squareSmall2x}`],
  );
  const restaurantListing = Listing(restaurantResponse);
  const { avatarImageId } = restaurantListing.getPublicData();

  const restaurantImages = restaurantListing.getImages();

  const restaurantAvatarImage = getListingImageById(
    avatarImageId,
    restaurantImages,
  );
  const newRestaurantAvatarImage = {
    ...restaurantAvatarImage,
    id: {
      uuid: restaurantAvatarImage.id.uuid,
    },
  };

  const subOrderDocument = {
    participantId,
    orderId,
    planId,
    restaurantId,
    ...(transactionId && { transactionId }),
    restaurantName,
    foodName,
    restaurantAvatarImage: newRestaurantAvatarImage,
    status,
    txStatus: 'pending',
    deliveryHour,
    createdAt: new Date(),
  };

  await setCollectionDocWithCustomId(
    `${participantId} - ${planId} - ${timestamp}`,
    subOrderDocument,
    FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME!,
  );
};
export const updateFirebaseDocument = async (
  subOrderId: string,
  params: any,
) => {
  const { txStatus, reviewId, status } = params;
  const allowedParams = {
    ...(txStatus && { txStatus }),
    ...(reviewId && { reviewId }),
    ...(status && { status }),
  };
  await updateCollectionDoc(
    subOrderId,
    allowedParams,
    FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME!,
  );
};
