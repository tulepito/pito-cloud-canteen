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
    removedImageIds,
  } = values;

  const avatarImageIdMaybe = getSubmitImageId(uploadedAvatars)?.[0]?.uuid;
  const coverImageIdMaybe = getSubmitImageId(uploadedCovers)?.[0]?.uuid;

  const submittedValues = {
    id,
    images: getUniqueImages([
      ...getSubmitImageId(uploadedCovers),
      ...getSubmitImageId(uploadedAvatars),
      ...getSubmitImageId(oldImages),
    ]).filter((image) => !removedImageIds.includes(image.uuid)),
    publicData: {
      ...(avatarImageIdMaybe !== null && avatarImageIdMaybe
        ? { avatarImageId: avatarImageIdMaybe }
        : {}),
      ...(coverImageIdMaybe !== null && coverImageIdMaybe
        ? { coverImageId: coverImageIdMaybe }
        : {}),
    },
  };

  return submittedValues;
};
