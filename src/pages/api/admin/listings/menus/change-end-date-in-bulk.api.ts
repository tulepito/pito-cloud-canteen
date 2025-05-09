/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { fetchListingsByChunkedIds, queryAllPages } from '@helpers/apiHelpers';
import { isUserABookerOrOwner } from '@helpers/user';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import type {
  OrderListing,
  QuotationListing,
  RestaurantListing,
  UserListing,
} from '@src/types';
import {
  buildFullName,
  buildFullNameFromProfile,
} from '@src/utils/emailTemplate/participantOrderPicking';
import { EListingType, EMenuType } from '@src/utils/enums';

const TIME_FROM = new Date('12/31/2023');
const TIME_TO = new Date('12/31/2024');

export type ToolType =
  | 'change-end-date-in-bulk'
  | 'fetch-all-bookers-participants'
  | 'fetch-all-partners';

export interface POSTChangeMenuEndDateInBulkBody {
  type: ToolType;
}

const { NEXT_PUBLIC_ENV } = process.env;

function processDateByTimezone(date: Date) {
  let OFFSET_HOURS = 7;
  if (NEXT_PUBLIC_ENV === 'development') {
    OFFSET_HOURS = 0;
  }

  return new Date(date.setHours(date.getHours() - OFFSET_HOURS)).getTime();
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { type } = req.body as POSTChangeMenuEndDateInBulkBody;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        if (type === 'change-end-date-in-bulk') {
          const oldEndDate = processDateByTimezone(TIME_FROM);
          const endDate = processDateByTimezone(TIME_TO);

          const menus = await queryAllPages({
            sdkModel: integrationSdk.listings,
            query: {
              meta_listingType: EListingType.menu,
              meta_menuType: EMenuType.fixedMenu,
              pub_endDate: oldEndDate,
            },
          });

          const updatePromises = menus.map((menu: any) => {
            const menuId = menu.id.uuid;
            const newPublicData = {
              ...menu.attributes.publicData,
              endDate,
            };

            return integrationSdk.listings.update({
              id: menuId,
              publicData: newPublicData,
            });
          });

          await Promise.all(updatePromises);
          res.status(200).json({
            message: 'success',
            data: {
              ids: menus.map((menu: any) => menu.id.uuid),
              oldEndDate,
              endDate,
            },
          });
        }

        if (type === 'fetch-all-bookers-participants') {
          const companies: UserListing[] = await queryAllPages({
            sdkModel: integrationSdk.users,
            query: {
              meta_isCompany: true,
            },
          });
          const users: UserListing[] = await queryAllPages({
            sdkModel: integrationSdk.users,
            query: {},
          });

          res.status(200).json(
            users
              .filter(
                (user) =>
                  !user.attributes?.profile?.displayName?.startsWith(
                    'Sub account for',
                  ),
              )
              .map((user) => ({
                email: user.attributes?.email,
                fullName: buildFullName(
                  user.attributes?.profile?.firstName,
                  user.attributes?.profile?.lastName,
                  {
                    compareToGetLongerWith:
                      user.attributes?.profile?.displayName,
                  },
                ),
                companyName:
                  companies.find(
                    (company) =>
                      company.id?.uuid ===
                      user.attributes?.profile?.metadata?.companyList?.[0],
                  )?.attributes?.profile?.publicData?.companyName ||
                  companies.find((company) =>
                    user.attributes?.profile?.metadata?.companyList?.includes(
                      company.id?.uuid,
                    ),
                  )?.attributes?.profile?.publicData?.companyName,
                role: user.attributes?.profile?.metadata?.isPartner
                  ? 'partner'
                  : user.attributes?.profile?.metadata?.isAdmin
                  ? 'admin'
                  : user.attributes?.profile?.metadata?.company &&
                    isUserABookerOrOwner(user)
                  ? 'booker'
                  : 'participant',
              })),
          );
        }

        if (type === 'fetch-all-partners') {
          const partners: UserListing[] = await queryAllPages({
            sdkModel: integrationSdk.users,
            query: {
              meta_isPartner: true,
            },
          });

          const restaurantListings: RestaurantListing[] = await queryAllPages({
            sdkModel: integrationSdk.listings,
            query: {
              meta_listingType: EListingType.restaurant,
            },
          });

          const FLAG_UPDATE_RESTAURANT = false;
          if (FLAG_UPDATE_RESTAURANT) {
            for (const restaurant of restaurantListings) {
              const restaurantId = restaurant.id?.uuid!;
              const ordersOfRestaurant: OrderListing[] = await queryAllPages({
                sdkModel: integrationSdk.listings,
                query: {
                  meta_listingType: EListingType.order,
                  meta_partnerIds: `has_any:${restaurantId}`,
                },
              });
              const { quotationIds } = ordersOfRestaurant.reduce(
                (acc, order) => {
                  const { quotationIds: accQuotationIds } = acc;
                  const { quotationId } = order.attributes?.metadata || {};

                  return {
                    quotationIds: [...accQuotationIds, quotationId || ''],
                  };
                },
                {
                  quotationIds: [],
                } as {
                  quotationIds: string[];
                },
              );

              const allQuotations: QuotationListing[] =
                await fetchListingsByChunkedIds(quotationIds, integrationSdk);

              let totalOrders = 0;
              const firstOrderBookedAt =
                allQuotations[allQuotations.length - 1]?.attributes?.createdAt;

              const totalRevenue = allQuotations.reduce((acc, quotation) => {
                const { partner: quotationsOfPartners } =
                  quotation.attributes?.metadata || {};

                const partnerQuotationsByDates =
                  quotationsOfPartners?.[restaurantId]?.quotation;

                const totalPrice = Object.values(
                  partnerQuotationsByDates || {},
                ).reduce((totalPriceAcc, partnerQuotationsByDate) => {
                  const _totalPrice = (partnerQuotationsByDate || []).reduce(
                    (_totalPriceByDate, foodByDate) => {
                      const { foodPrice, frequency } = foodByDate || {};

                      totalOrders += 1;

                      const foodPriceNumber = Number(foodPrice || 0);
                      const frequencyNumber = Number(frequency || 0);

                      return (
                        _totalPriceByDate + foodPriceNumber * frequencyNumber
                      );
                    },
                    0,
                  );

                  return totalPriceAcc + _totalPrice;
                }, 0);

                return acc + (totalPrice || 0);
              }, 0);

              console.log(restaurant.attributes?.title, restaurant.id?.uuid, {
                allQuotationsCount: allQuotations.length,
                totalRevenue,
                firstOrderBookedAt,
                totalOrders,
              });

              await integrationSdk.listings.update({
                id: restaurantId,
                privateData: {
                  summary: {
                    firstOrderBookedAt: firstOrderBookedAt
                      ? new Date(firstOrderBookedAt).valueOf()
                      : null,
                    totalRevenue,
                    totalOrders,
                    lastUpdatedAt: new Date().valueOf(),
                  },
                },
              });
            }

            return res.status(200).json({
              message: 'success',
            });
          }

          const restaurantWithIdMapper = restaurantListings.reduce(
            (acc, restaurant) => {
              const restaurantId = restaurant.id?.uuid!;
              const restaurantData = restaurant;

              return {
                ...acc,
                [restaurantId]: restaurantData,
              };
            },
            {} as Record<string, RestaurantListing>,
          );

          res.status(200).json(
            partners
              .map((partner) => ({
                ...partner,
                restaurantData: restaurantWithIdMapper[
                  partner.attributes?.profile?.metadata?.restaurantListingId!
                ] as RestaurantListing | undefined,
              }))
              .map((partner) => ({
                URL: `https://cloudcanteen.pito.vn/admin/partner/${partner.restaurantData?.id?.uuid}/edit/`,
                'Partner Name': buildFullNameFromProfile(
                  partner.attributes?.profile,
                ),
                'Tên thương hiệu ': partner.restaurantData?.attributes?.title,
                'Adress ':
                  partner.restaurantData?.attributes?.publicData?.location
                    ?.address,
                Email: partner.attributes?.email,
                Phone:
                  partner.restaurantData?.attributes?.publicData?.phoneNumber,
                VSATTP:
                  partner.restaurantData?.attributes?.publicData
                    ?.foodCertificate?.status === 'yes'
                    ? 'Có'
                    : 'Không',
                PIC: partner.restaurantData?.attributes?.publicData
                  ?.contactorName,
                Year: partner.attributes?.createdAt
                  ? new Date(partner.attributes?.createdAt).getFullYear()
                  : 'N/A',
                'Pricing Range -> Min Price': String(
                  partner.restaurantData?.attributes?.publicData?.minPrice || 0,
                ).replace('.', ''),
                Status:
                  partner.restaurantData?.attributes?.metadata?.status ===
                  'unsatisfactory'
                    ? 'Chưa đạt yêu cầu'
                    : partner.restaurantData?.attributes?.metadata?.status ===
                      'authorized'
                    ? 'Đã duyệt'
                    : 'Mới tạo',
                'Cài đặt nhà hàng':
                  partner.restaurantData?.attributes?.publicData?.vat === 'vat'
                    ? 'Xuất hóa đơn VAT'
                    : partner.restaurantData?.attributes?.publicData?.vat ===
                      'noExportVat'
                    ? 'Không xuất hóa đơn VAT'
                    : 'Xuất hóa đơn trực tiếp',
                'Bao bì thường sử dụng': (
                  partner.restaurantData?.attributes?.publicData?.packaging?.map(
                    (p) => p?.replaceAll('packaging-', '') || 'N/A',
                  ) || []
                ).join(', '),
                'Ngày có đơn đầu tiên': partner.restaurantData?.attributes
                  ?.privateData?.summary?.firstOrderBookedAt
                  ? new Date(
                      partner.restaurantData?.attributes?.privateData?.summary?.firstOrderBookedAt,
                    )?.toLocaleString('en-US', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })
                  : 'N/A',
                'Tổng doanh thu đối tác': (
                  partner.restaurantData?.attributes?.privateData?.summary
                    ?.totalRevenue || 0
                ).toString(),
                'Số lượng đơn hàng đã có':
                  partner.restaurantData?.attributes?.privateData?.summary
                    ?.totalOrders,
              })),
          );
        }

        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
