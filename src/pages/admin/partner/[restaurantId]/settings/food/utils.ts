import { types as sdkTypes } from '@helpers/sdkLoader';
import { ListingTypes } from '@src/types/listingTypes';
import type { EMenuTypes } from '@utils/enums';
import { getSubmitImageId, getUniqueImages } from '@utils/images';
import type { TImage } from '@utils/types';

const { Money } = sdkTypes;

const parsePriceToMoneyFormat = (price: string) => {
  const priceRemoveComma = price.toString().split(',');
  const mergeWithoutComma = priceRemoveComma.join('');
  const parsedPrice = Number(mergeWithoutComma);
  return new Money(Number(parsedPrice), 'VND');
};

export type TEditPartnerFoodFormValues = {
  id?: string;
  images: TImage[];
  addImages: TImage[] | number[];
  title: string;
  menuType: typeof EMenuTypes.fixedMenu | typeof EMenuTypes.cycleMenu;
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
  const priceRemoveComma = price.toString().split(',');
  const mergeWithoutComma = priceRemoveComma.join('');
  const parsePrice = Number(mergeWithoutComma);
  return {
    images: getUniqueImages([...getSubmitImageId(images)]),
    title,
    description,
    price: new Money(Number(parsePrice), 'VND'),
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
    price: parsePriceToMoneyFormat(price),
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
    price: parsePriceToMoneyFormat(price),
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
    price: parsePriceToMoneyFormat(price),
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
