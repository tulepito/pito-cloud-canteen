import type { TImage, TListing } from './types';

export const pickRenderableImages = (
  currentListing: any,
  uploadedImages: any,
  uploadedImageIdsInOrder: any[] = [],
  removedImageIds: any[] = [],
) => {
  // Images are passed to EditListingForm so that it can generate thumbnails out of them
  const currentListingImages =
    currentListing && currentListing.images ? currentListing.images : [];
  // Images not yet connected to the listing
  const unattachedImages = uploadedImageIdsInOrder.map(
    (i) => uploadedImages[i],
  );
  const allImages = currentListingImages.concat(unattachedImages);

  const pickImagesAndIds = (imgs: any, img: any) => {
    const imgId = img.imageId || img.id;
    // Pick only unique images that are not marked to be removed
    const shouldInclude =
      !imgs.imageIds.includes(imgId) && !removedImageIds.includes(imgId);
    if (shouldInclude) {
      imgs.imageEntities.push(img);
      imgs.imageIds.push(imgId);
    }
    return imgs;
  };

  // Return array of image entities. Something like: [{ id, imageId, type, attributes }, ...]
  return allImages.reduce(pickImagesAndIds, { imageEntities: [], imageIds: [] })
    .imageEntities;
};

export const pickRenderableImagesByProperty = (
  currentListing: TListing,
  uploadedImages: any,
  uploadedImageIdsInOrder: any[] = [],
  removedImageIds: any[] = [],
  property = '',
) => {
  const savedImageId = currentListing.attributes.publicData[property];

  // Images are passed to EditListingForm so that it can generate thumbnails out of them
  const currentListingImages =
    currentListing && currentListing.images ? currentListing.images : [];

  const images = currentListingImages.filter(
    (img: TImage) => img.id.uuid === savedImageId,
  );

  // Images not yet connected to the listing
  const unattachedImages = uploadedImageIdsInOrder.map(
    (i) => uploadedImages[i],
  );
  const allImages = images.concat(unattachedImages);

  const pickImagesAndIds = (imgs: any, img: any) => {
    const imgId = img.imageId || img.id;
    // Pick only unique images that are not marked to be removed
    const shouldInclude =
      !imgs.imageIds.includes(imgId) && !removedImageIds.includes(imgId);
    if (shouldInclude) {
      imgs.imageEntities.push(img);
      imgs.imageIds.push(imgId);
    }
    return imgs;
  };

  // Return array of image entities. Something like: [{ id, imageId, type, attributes }, ...]
  return allImages.reduce(pickImagesAndIds, { imageEntities: [], imageIds: [] })
    .imageEntities;
};

export const pickRenderableLicenseImagesByProperty = (
  currentListing: TListing,
  uploadedImages: any,
  uploadedImageIdsInOrder: any[] = [],
  removedImageIds: any[] = [],
  property = '',
) => {
  const savedImageId = currentListing.attributes.publicData[property]?.imageId;

  // Images are passed to EditListingForm so that it can generate thumbnails out of them
  const currentListingImages =
    currentListing && currentListing.images ? currentListing.images : [];

  const images = currentListingImages.filter(
    (img: TImage) => img.id.uuid === savedImageId,
  );

  // Images not yet connected to the listing
  const unattachedImages = uploadedImageIdsInOrder.map(
    (i) => uploadedImages[i],
  );
  const allImages = images.concat(unattachedImages);

  const pickImagesAndIds = (imgs: any, img: any) => {
    const imgId = img.imageId || img.id;
    // Pick only unique images that are not marked to be removed
    const shouldInclude =
      !imgs.imageIds.includes(imgId) && !removedImageIds.includes(imgId);
    if (shouldInclude) {
      imgs.imageEntities.push(img);
      imgs.imageIds.push(imgId);
    }
    return imgs;
  };

  // Return array of image entities. Something like: [{ id, imageId, type, attributes }, ...]
  return allImages.reduce(pickImagesAndIds, { imageEntities: [], imageIds: [] })
    .imageEntities;
};
