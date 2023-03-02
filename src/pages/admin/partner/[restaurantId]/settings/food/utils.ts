import { types as sdkTypes } from '@helpers/sdkLoader';
import { ListingTypes } from '@src/types/listingTypes';
import { EListingStates, EMenuTypes } from '@utils/enums';
import { getSubmitImageId, getUniqueImages } from '@utils/images';
import { removeAccents } from '@utils/string';
import type { TImage } from '@utils/types';

const { Money } = sdkTypes;

const getNumberOnly = (price: string) => {
  return price.replace(/\D/g, '');
};

const parsePriceToMoneyFormat = (price: string) => {
  const formattedPrice = getNumberOnly(price);
  const parsedPrice = Number(formattedPrice);
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

const CSV_TABLE_HEADER_IN_VI = {
  'Tên món ăn': 'title',
  'Loại menu': 'menuType',
  'Phân loại': 'foodType',
  'Mô tả chi tiết': 'description',
  'Chất liệu bao bì': 'packagingMaterial',
  'Đơn giá (vnđ)': 'price',
  'Số món chính (món)': 'numberOfMainDishes',
  'Món xào': 'sideDishes.stir-fried-meal',
  'Món canh': 'sideDishes.soup',
  'Tráng miệng': 'sideDishes.dessert',
  'Nước uống': 'sideDishes.drink',
  'Thành phần dị ứng': 'allergicIngredients',
};

const MENU_TYPES_FROM_CSV = {
  'menu co dinh': EMenuTypes.fixedMenu,
  'menu theo chu ky': EMenuTypes.cycleMenu,
};

export const getImportDataFromCsv = (values: any) => {
  const newValues = Object.keys(values).reduce((prev: any, key: any) => {
    const parsedKey = removeAccents(String(key).toLowerCase().trim());
    const keyAsVn = Object.keys(CSV_TABLE_HEADER_IN_VI).find((k) => {
      const keyToCompare = removeAccents(String(k).toLowerCase().trim());
      return keyToCompare === parsedKey;
    });
    const newKey =
      CSV_TABLE_HEADER_IN_VI[keyAsVn as keyof typeof CSV_TABLE_HEADER_IN_VI];

    return {
      ...prev,
      ...(newKey ? { [newKey]: values[key] } : { [key]: values[key] }),
    };
  }, {});

  const {
    title,
    description,
    price,
    restaurantId,
    allergicIngredients,
    numberOfMainDishes,
    packagingMaterial,
    foodType,
    menuType,
    ...rest
  } = newValues;

  const sideDishes = Object.keys(rest).reduce((prev: any, key: any) => {
    const [valueKey] = key.split('.');
    return [...prev, valueKey];
  }, []);

  const menuTypeWithoutAccent = removeAccents(
    String(menuType).toLowerCase().trim(),
  );

  const formattedMenuType =
    MENU_TYPES_FROM_CSV[
      menuTypeWithoutAccent as keyof typeof MENU_TYPES_FROM_CSV
    ];

  return {
    title,
    description,
    price: parsePriceToMoneyFormat(price),
    publicData: {
      sideDishes,
      allergicIngredients,
      numberOfMainDishes: Number(numberOfMainDishes),
      packagingMaterial,
      foodType,
    },
    metadata: {
      menuType: formattedMenuType,
      restaurantId,
      listingType: ListingTypes.FOOD,
      listingStates: EListingStates.published,
    },
  };
};
