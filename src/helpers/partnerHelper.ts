import { getSubmitImageId, getUniqueImages } from '@src/utils/images';
import type { TOwnListing } from '@src/utils/types';

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
    website = '',
    facebookLink = '',
    meals,
    categories,
    isActive,
    phoneNumber,
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
      ...(contactorName ? { contactorName } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
      ...(meals ? { meals } : {}),
      ...(categories ? { categories } : {}),
      ...(typeof isActive !== 'undefined' ? { isActive } : {}),
    },
  };

  return submittedValues;
};
