import { types as sdkTypes } from '@helpers/sdkLoader';
import { ListingTypes } from '@src/types/listingTypes';
import type { CYCLE_MENU_KEY, FIXED_MENU_KEY } from '@utils/errors';
import { getSubmitImageId, getUniqueImages } from '@utils/images';
import type { TImage } from '@utils/types';

const { Money } = sdkTypes;

export type TEditPartnerFoodFormValues = {
  id?: string;
  images: TImage[];
  addImages: TImage[] | number[];
  title: string;
  menuType: typeof FIXED_MENU_KEY | typeof CYCLE_MENU_KEY;
  minOrderHourInAdvance: string;
  minQuantity: string;
  maxMember: string;
  category: string[];
  specialDiets: string[];
  foodType: string;
  categoryOther: string;
  price: string;
  ingredients: string;
  sideDishes: string[];
  description: string;
  notes: string;
  restaurantId?: string;
  unit?: string;
};

export const getSubmitFoodData = (values: TEditPartnerFoodFormValues) => {
  const {
    images,
    title,
    description,
    price,
    // eslint-disable-next-line unused-imports/no-unused-vars
    addImages,
    restaurantId,
    ...rest
  } = values;
  return {
    images: getUniqueImages([...getSubmitImageId(images)]),
    title,
    description,
    price: new Money(Number(price), 'VND'),
    publicData: {
      ...rest,
    },
    metadata: {
      restaurantId,
      listingType: ListingTypes.FOOD,
    },
  };
};

export const getUpdateFoodData = (values: TEditPartnerFoodFormValues) => {
  const {
    id,
    images,
    title,
    description,
    price,
    // eslint-disable-next-line unused-imports/no-unused-vars
    addImages,
    ...rest
  } = values;
  return {
    ...(id ? { id } : {}),
    images: getUniqueImages([...getSubmitImageId(images)]),
    title,
    description,
    price: new Money(Number(price), 'VND'),
    publicData: {
      ...rest,
    },
  };
};

export const getDuplicateData = (values: TEditPartnerFoodFormValues) => {
  const {
    images = [],
    title,
    description,
    price,
    // eslint-disable-next-line unused-imports/no-unused-vars
    addImages,
    restaurantId,
    ...rest
  } = values;
  return {
    ...(images ? { images: images.filter((i: TImage) => !!i) } : {}),
    title,
    description,
    price: new Money(Number(price), 'VND'),
    publicData: {
      ...rest,
    },
    metadata: {
      restaurantId,
      listingType: ListingTypes.FOOD,
    },
  };
};

export const getImportDataFromCsv = (values: any) => {
  const {
    images = [],
    title,
    description,
    price,
    // eslint-disable-next-line unused-imports/no-unused-vars
    addImages,
    restaurantId,
    specialDiets,
    sideDishes,
    ...rest
  } = values;
  return {
    ...(images ? { images: images.filter((i: TImage) => !!i) } : {}),
    title,
    description,
    price: new Money(Number(price), 'VND'),
    publicData: {
      specialDiets: specialDiets.split(','),
      sideDishes: sideDishes.split(','),
      ...rest,
    },
    metadata: {
      restaurantId,
      listingType: ListingTypes.FOOD,
    },
  };
};
