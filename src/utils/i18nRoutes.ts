import { viWebsitePaths, websitePaths } from '../paths';
import type { TLocale } from '../types/utils';

export const i18nRoutes = {
  mealBoxDelivery: {
    en: websitePaths.MealBoxDelivery,
    vi: viWebsitePaths.MealBoxDelivery,
  },
  popupCanteen: {
    en: websitePaths.PopupCanteen,
    vi: viWebsitePaths.PopupCanteen,
  },
  solutionsSmallBusiness: {
    en: websitePaths.SmallBusiness,
    vi: viWebsitePaths.SmallBusiness,
  },
  solutionsMiddleBusiness: {
    en: websitePaths.MiddleBusiness,
    vi: viWebsitePaths.MiddleBusiness,
  },
  solutionsStartup: {
    en: websitePaths.Startup,
    vi: viWebsitePaths.Startup,
  },
  solutionsTechService: {
    en: websitePaths.TechService,
    vi: viWebsitePaths.TechService,
  },
  solutionsAdmin: {
    en: websitePaths.Admin,
    vi: viWebsitePaths.Admin,
  },
  solutionsEmployees: {
    en: websitePaths.Employee,
    vi: viWebsitePaths.Employee,
  },
} as const;

export function getLocalizedPath(
  routeKey: keyof typeof i18nRoutes,
  locale: TLocale,
) {
  return i18nRoutes[routeKey][locale];
}

export function getLocalizedPathFromCurrentPath(
  currentPath: string,
  targetLocale: TLocale,
): string {
  if (currentPath === '/website' || currentPath === '/website/') {
    return targetLocale === 'en' ? '/en' : '/';
  }
  const foundRoute = Object.values(i18nRoutes).find(
    (paths) => paths.en === currentPath || paths.vi === currentPath,
  );

  return foundRoute ? foundRoute[targetLocale] : currentPath;
}
