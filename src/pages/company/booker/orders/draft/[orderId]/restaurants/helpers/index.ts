export const getListingImageById = (imageId: string, images: any[]) => {
  const image = images.find((img) => img.id.uuid === imageId);

  return image;
};
