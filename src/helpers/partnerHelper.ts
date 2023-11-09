import { DateTime } from 'luxon';

import { CurrentUser } from '@src/utils/data';
import { getSubmitImageId, getUniqueImages } from '@src/utils/images';
import type { TCurrentUser, TObject, TOwnListing } from '@src/utils/types';

export const createSubmitUpdatePartnerValues = (
  values: any,
  _partnerListingRef: TOwnListing,
) => {
  const {
    id,
    uploadedCovers = [],
    uploadedAvatars = [],
    oldImages = [],
    location,
    contactorName,
    removedImageIds = [],
    website,
    facebookLink,
    meals,
    categories,
    isActive,
    phoneNumber,
    startStopReceiveOrderDate,
    endStopReceiveOrderDate,
    stopReceiveOrder,
  } = values;
  const { selectedPlace = {} } = location || {};
  const { address, origin } = selectedPlace;

  const avatarImageIdMaybe = getSubmitImageId(uploadedAvatars)?.[0]?.uuid;
  const coverImageIdMaybe = getSubmitImageId(uploadedCovers)?.[0]?.uuid;

  const submittedValues = {
    id,
    ...(origin ? { geolocation: origin } : {}),
    images: getUniqueImages([
      ...getSubmitImageId(uploadedCovers),
      ...getSubmitImageId(uploadedAvatars),
      ...getSubmitImageId(oldImages),
    ]).filter((image) => !removedImageIds.includes(image.uuid)),
    publicData: {
      ...(address ? { location: { address } } : {}),
      ...(avatarImageIdMaybe !== null && avatarImageIdMaybe
        ? { avatarImageId: avatarImageIdMaybe }
        : {}),
      ...(coverImageIdMaybe !== null && coverImageIdMaybe
        ? { coverImageId: coverImageIdMaybe }
        : {}),
      ...(typeof website !== 'undefined' ? { website } : {}),
      ...(typeof facebookLink !== 'undefined' ? { facebookLink } : {}),
      // #region Stop receive order fields
      ...(typeof startStopReceiveOrderDate === 'number'
        ? {
            startStopReceiveOrderDate: DateTime.fromMillis(
              startStopReceiveOrderDate,
            )
              .startOf('day')
              .toMillis(),
          }
        : {}),
      ...(typeof endStopReceiveOrderDate === 'number'
        ? {
            endStopReceiveOrderDate: DateTime.fromMillis(
              endStopReceiveOrderDate,
            )
              .startOf('day')
              .toMillis(),
          }
        : {}),
      ...(typeof stopReceiveOrder !== 'undefined' ? { stopReceiveOrder } : {}),
      ...(contactorName ? { contactorName } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
      ...(meals ? { meals } : {}),
      ...(categories ? { categories } : {}),
      ...(typeof isActive !== 'undefined' ? { isActive } : {}),
    },
  };

  return submittedValues;
};

export const checkPartnerWasRemovedFromSubOrder = (
  partner: TCurrentUser,
  subOrder: TObject,
) => {
  const { restaurant = {} } = subOrder || {};
  const { id: restaurantId } = restaurant;
  const partnerUser = CurrentUser(partner);
  const { restaurantListingId } = partnerUser.getMetadata();

  return restaurantId !== restaurantListingId;
};
