import { ALL_WEEK_APPLY } from '@components/FormFields/FieldAvailability/FieldAvailability';
import { OTHER_OPTION } from '@src/utils/options';
import { getDefaultTimeZoneOnBrowser } from '@utils/dates';
import { EDayOfWeek, EPartnerVATSetting } from '@utils/enums';
import type { TAvailabilityPlan, TOwnListing } from '@utils/types';

export const defaultTimeZone = () =>
  typeof window !== 'undefined' ? getDefaultTimeZoneOnBrowser() : 'Etc/UTC';

const getUniqueImages = (images: any[]) => {
  const resArr = [] as any[];
  images.forEach((item) => {
    const i = resArr.findIndex((x) => x.uuid === item.uuid);
    if (i <= -1) {
      resArr.push(item);
    }
  });

  return resArr;
};

const getDataWithRemovedOtherField = (arr: string[]) =>
  arr.filter((item: string) => item !== 'other');

// Create entries from submit values
export const createEntriesFromSubmitValues = (values: any) =>
  Object.keys(EDayOfWeek).reduce((allEntries, dayOfWeek) => {
    const dayValues = values[dayOfWeek] || [];
    const dayEntries = dayValues.map((dayValue: any) => {
      const { startTime, endTime } = dayValue;

      // Note: This template doesn't support seats yet.
      return startTime && endTime
        ? {
            dayOfWeek,
            seats: 100,
            startTime,
            endTime: endTime === '24:00' ? '00:00' : endTime,
          }
        : null;
    });

    return allEntries.concat(dayEntries.filter((e: string) => !!e));
  }, []);

// Create availabilityPlan from submit values
const createAvailabilityPlan = (values: any) => ({
  type: 'availability-plan/time',
  timezone: values.timezone || defaultTimeZone(),
  entries: createEntriesFromSubmitValues(values),
});

const getSubmitImageId = (images: any) => {
  return images.map((img: any) => (img.imageId ? img.imageId : img.id));
};

const createSubmitBankAccount = (bankAccounts: any[]) => {
  if (bankAccounts.length === 1 && !bankAccounts[0].isDefault) {
    const newBankAccounts = [...bankAccounts];
    newBankAccounts[0].isDefault = true;

    return newBankAccounts;
  }

  return bankAccounts;
};

const createAvailabilityPlanFromAllWeekEntries = (
  allWeekAvailabilityEntries: any,
  daysToApply: any[],
) => {
  const isAllWeekApply = daysToApply.includes(ALL_WEEK_APPLY);
  const availabilityPlanDays = !isAllWeekApply
    ? daysToApply.filter((d: string) => d !== ALL_WEEK_APPLY)
    : Object.keys(EDayOfWeek);
  const availabilityPlan = availabilityPlanDays.reduce(
    (prev: any, curD: string) => ({
      timezone: getDefaultTimeZoneOnBrowser(),
      ...prev,
      [curD]: allWeekAvailabilityEntries.map((curE: any) => {
        return {
          ...curE,
          dayOfWeek: curD,
          seats: 100,
        };
      }),
    }),
    {},
  );

  return createAvailabilityPlan(availabilityPlan);
};

const getListWithNewOtherValues = (
  newOtherValue: string,
  oldOtherValue: string,
  list: string[],
  hasOtherValueInList: boolean,
) => {
  const newList = [...list];

  const oldOtherItemIndex = newList.indexOf(oldOtherValue);
  if (!hasOtherValueInList && oldOtherItemIndex >= 0) {
    newList.splice(oldOtherItemIndex, 1);

    return newList;
  }

  const otherValueIndex = newList.findIndex(
    (str: string) => str === newOtherValue,
  );

  const notChange = newOtherValue === oldOtherValue;
  // otherValueIndex >= 0 is value not change => don't need to update
  //! otherValue is other is null => don't need to add

  if (otherValueIndex >= 0 || !newOtherValue || notChange) {
    return newList;
  }

  // replace old other value to new other value

  if (oldOtherItemIndex >= 0) {
    newList[oldOtherItemIndex] = newOtherValue;
  } else {
    newList.push(newOtherValue);
  }

  return newList;
};

const createSubmitPrice = (minPrice: string) => {
  return minPrice.split(',').join('');
};

export const createSubmitUpdatePartnerValues = (
  values: any,
  partnerListingRef: TOwnListing,
) => {
  const {
    id,
    title,
    location,
    availabilityPlan,
    packaging = [],
    website = '',
    description = '',
    contactorName,
    companyName,
    facebookLink = '',
    vat,
    minPrice,
    phoneNumber,
    availabilityApplyType,
    uploadedCovers,
    uploadedAvatars,
    bankAccounts,
    oldImages,
    allWeekAvailabilityEntries,
    daysToApply,
    packagingOther,
    minQuantity,
    maxQuantity,
  } = values;

  const oldPackagingOtherValue =
    partnerListingRef?.attributes?.publicData?.packagingOther;

  const {
    selectedPlace: { address, origin },
  } = location || {};

  const packagingHasOtherValue = packaging.includes(OTHER_OPTION);

  const submittedValues = {
    id,
    title,
    availabilityPlan:
      availabilityApplyType === ALL_WEEK_APPLY
        ? createAvailabilityPlanFromAllWeekEntries(
            allWeekAvailabilityEntries,
            daysToApply,
          )
        : createAvailabilityPlan(availabilityPlan),
    geolocation: origin,
    description,
    images: getUniqueImages([
      ...getSubmitImageId(uploadedCovers),
      ...getSubmitImageId(uploadedAvatars),
      ...getSubmitImageId(oldImages),
    ]),
    publicData: {
      location: { address },
      minPrice: createSubmitPrice(minPrice),
      packaging: getDataWithRemovedOtherField(
        getListWithNewOtherValues(
          packagingOther,
          oldPackagingOtherValue,
          packaging,
          packagingHasOtherValue,
        ),
      ),
      ...(packagingHasOtherValue
        ? { packagingOther }
        : { packagingOther: null }),
      website,
      facebookLink,
      contactorName,
      companyName,
      vat,
      avatarImageId: getSubmitImageId(uploadedAvatars)?.[0]?.uuid,
      coverImageId: getSubmitImageId(uploadedCovers)?.[0]?.uuid,
      availabilityApplyType,
      phoneNumber,
      allWeekAvailabilityEntries,
      minQuantity,
      maxQuantity,
    },
    privateData: {
      bankAccounts: createSubmitBankAccount(bankAccounts),
    },
  };

  return submittedValues;
};

export const createSubmitCreatePartnerValues = (values: any) => {
  const {
    title,
    email,
    password,
    location,
    availabilityPlan,
    packaging = [],
    website,
    description,
    contactorName,
    companyName,
    facebookLink,
    vat = EPartnerVATSetting.vat,
    minPrice,
    phoneNumber,
    availabilityApplyType,
    uploadedCovers,
    uploadedAvatars,
    bankAccounts,
    allWeekAvailabilityEntries,
    daysToApply,
    packagingOther,
    minQuantity,
    maxQuantity,
  } = values;
  const {
    selectedPlace: { address, origin },
  } = location || {};

  const userData = {
    firstName: title,
    lastName: ' ',
    email,
    password,
  };

  const listingData = {
    title,
    availabilityPlan:
      availabilityApplyType === ALL_WEEK_APPLY
        ? createAvailabilityPlanFromAllWeekEntries(
            allWeekAvailabilityEntries,
            daysToApply,
          )
        : createAvailabilityPlan(availabilityPlan),
    geolocation: origin,
    description,
    images: [
      ...getSubmitImageId(uploadedCovers),
      ...getSubmitImageId(uploadedAvatars),
    ],
    publicData: {
      location: { address },
      minPrice: createSubmitPrice(minPrice),
      packaging: getDataWithRemovedOtherField([
        ...packaging,
        ...(packagingOther ? [packagingOther] : []),
      ]),
      ...(packagingOther ? { packagingOther } : { packagingOther: null }),
      website,
      facebookLink,
      contactorName,
      companyName,
      vat: vat in EPartnerVATSetting ? vat : EPartnerVATSetting.vat,
      avatarImageId: getSubmitImageId(uploadedAvatars)?.[0]?.uuid,
      coverImageId: getSubmitImageId(uploadedCovers)?.[0]?.uuid,
      availabilityApplyType,
      phoneNumber,
      allWeekAvailabilityEntries,
      minQuantity,
      maxQuantity,
    },
    privateData: {
      bankAccounts: createSubmitBankAccount(bankAccounts),
      verifyEmail: { send: true },
    },
  };

  return { userData, listingData };
};

export const createSubmitLicenseTabValues = (values: any) => {
  const {
    id,
    uploadedBusinessLicense,
    uploadedFoodCertificate,
    uploadedPartyInsurance,
    businessLicense,
    foodCertificate,
    partyInsurance,
    oldImages,
    businessType,
  } = values;

  const submitValues = {
    id,
    publicData: {
      businessType,
      businessLicense: {
        imageId: getSubmitImageId(uploadedBusinessLicense)?.[0]?.uuid,
        status: businessLicense?.status,
      },
      foodCertificate: {
        imageId: getSubmitImageId(uploadedFoodCertificate)?.[0]?.uuid,
        status: foodCertificate?.status,
      },
      partyInsurance: {
        imageId: getSubmitImageId(uploadedPartyInsurance)?.[0]?.uuid,
        status: partyInsurance?.status,
      },
    },
    images: getUniqueImages([
      ...getSubmitImageId(uploadedBusinessLicense),
      ...getSubmitImageId(uploadedPartyInsurance),
      ...getSubmitImageId(uploadedFoodCertificate),
      ...getSubmitImageId(oldImages),
    ]),
  };

  return submitValues;
};

export const createSubmitMenuTabValues = (
  values: any,
  partnerListingRef: TOwnListing,
) => {
  const {
    id,
    meals,
    categories = [],
    categoriesOther,
    extraServices = [],
    extraServicesOther,
    hasOutsideMenuAndService,
  } = values;
  const oldCategoriesOtherValue =
    partnerListingRef?.attributes?.publicData?.categoriesOther;
  const oldExtraServicesOtherValue =
    partnerListingRef?.attributes?.publicData?.extraServicesOther;

  const categoriesHasOtherValue = categories.includes(OTHER_OPTION);
  const extraServicesHasOtherValue = extraServices.includes(OTHER_OPTION);

  const submitValues = {
    id,
    publicData: {
      meals,
      categories: getDataWithRemovedOtherField(
        getListWithNewOtherValues(
          categoriesOther,
          oldCategoriesOtherValue,
          categories,
          categoriesHasOtherValue,
        ),
      ),
      extraServices: getDataWithRemovedOtherField(
        getListWithNewOtherValues(
          extraServicesOther,
          oldExtraServicesOtherValue,
          extraServices,
          extraServicesHasOtherValue,
        ),
      ),
      ...(extraServicesHasOtherValue
        ? { extraServicesOther }
        : { extraServicesOther: null }),
      ...(categoriesHasOtherValue
        ? { categoriesOther }
        : { categoriesOther: null }),
      hasOutsideMenuAndService,
    },
  };

  return submitValues;
};

const createEntryDayGroups = (entries = [{}]) =>
  entries.reduce((groupedEntries: any, entry: any) => {
    const { startTime, endTime: endHour, dayOfWeek } = entry;
    const dayGroup = groupedEntries[dayOfWeek] || [];

    return {
      ...groupedEntries,
      [dayOfWeek]: [
        ...dayGroup,
        {
          startTime,
          endTime: endHour === '00:00' ? '24:00' : endHour,
        },
      ],
    };
  }, {});

// Create initial values
export const createAvailabilityPlanInitialValues = (
  availabilityPlan: TAvailabilityPlan,
) => {
  const { timezone, entries } = availabilityPlan || {};
  const tz = timezone || defaultTimeZone();

  return {
    timezone: tz,
    ...createEntryDayGroups(entries),
  };
};

export const createDayToApplyInitialValues = (
  availabilityPlan: TAvailabilityPlan,
) => {
  const { entries = [] } = availabilityPlan || {};

  return entries.map((entry: any) => entry.dayOfWeek);
};

export const getLocationInitialValues = (partnerListing: any) => {
  const { geolocation, publicData } = partnerListing.attributes || {};

  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent =
    publicData &&
    publicData.location &&
    publicData.location.address &&
    geolocation;
  const location = publicData && publicData.location ? publicData.location : {};
  const { address } = location;

  return locationFieldsPresent
    ? {
        search: address,
        selectedPlace: { address, origin: geolocation },
      }
    : {};
};
