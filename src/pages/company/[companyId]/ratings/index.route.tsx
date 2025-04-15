import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import format from 'date-fns/format';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as xlsx from 'xlsx';

import { getCompanyRatingsApi } from '@apis/companyApi';
import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Tooltip from '@components/Tooltip/Tooltip';
import { EmptyWrapper } from '@pages/admin/scanner/[planId]/EmptyWrapper';
import { LoadingWrapper } from '@pages/admin/scanner/[planId]/LoadingWrapper';
import OrderDateField from '@pages/company/booker/orders/new/quiz/meal-date/OrderDateField/OrderDateField';
import { buildFullNameFromProfile } from '@src/utils/emailTemplate/participantOrderPicking';

import type { BookerViewerRatingData } from '../dashboard/components/BookerRatingSection/BookerRatingSection';

export default function CompanyDetailRoute() {
  const [ratings, setRatings] = useState<BookerViewerRatingData[]>([]);
  const router = useRouter();
  const { companyId } = router.query;
  const [inProgress, setInProgress] = useState<boolean>(true);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const pageRef = useRef<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  const { query } = router;
  const {
    orderCode,
    startDate: startDateFromQuery,
    endDate: endDateFromQuery,
  } = query;

  const startDate = useMemo(() => {
    if (startDateFromQuery) {
      const date = new Date(startDateFromQuery as string);

      return date;
    }

    return undefined;
  }, [startDateFromQuery]);
  const endDate = useMemo(() => {
    if (endDateFromQuery) {
      const date = new Date(endDateFromQuery as string);

      return date;
    }

    return undefined;
  }, [endDateFromQuery]);

  const fetchRatings = useCallback(
    async (
      filterBy?: {
        orderCode?: string;
        page?: number;
        perPage?: number;
        startDate?: string;
        endDate?: string;
      },
      mode: 'export' | 'ui' = 'ui',
    ) => {
      try {
        if (mode === 'export') {
          setExporting(true);
        }

        if (mode === 'ui') {
          if (filterBy?.page && filterBy?.page > 1) {
            setLoadingMore(true);
          } else {
            setInProgress(true);
          }
        }

        setError(null);
        if (!companyId) return;

        const _page = filterBy?.page || 1;
        const _perPage = filterBy?.perPage || 5;
        const response = await getCompanyRatingsApi(companyId as string, {
          page: _page,
          perPage: _perPage,
          filterBy,
        });

        if (mode === 'ui') {
          setCanLoadMore(response.data.length >= 5);
          if (filterBy?.page && filterBy?.page > 1) {
            setRatings((prev) => [...prev, ...response.data]);
          } else {
            setRatings(response.data);
          }
        }

        if (mode === 'export') {
          return response.data;
        }
      } catch (err) {
        setError('Error loading company ratings');
        console.error('Failed to fetch ratings:', err);
      } finally {
        setInProgress(false);
        setLoadingMore(false);
        setExporting(false);
      }
    },
    [companyId],
  );

  /**
   * Fetch ratings when the component mounts or when the companyId changes
   */
  useEffect(() => {
    fetchRatings(
      {
        orderCode: orderCode as string,
        startDate: startDate ? new Date(startDate).toDateString() : undefined,
        endDate: endDate ? new Date(endDate).toDateString() : undefined,
      },
      'ui',
    );
  }, [companyId, endDate, fetchRatings, orderCode, startDate]);

  return (
    <MetaWrapper>
      <div className="w-full container p-4 pb-32 md:p-0 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <svg
            width="32px"
            height="32px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              {' '}
              <path
                d="M8.32181 14.4933C7.3798 15.9862 6.90879 16.7327 7.22969 17.3433C7.55059 17.9538 8.45088 18.0241 10.2514 18.1647L10.7173 18.201C11.2289 18.241 11.4848 18.261 11.7084 18.3785C11.9321 18.4961 12.0983 18.6979 12.4306 19.1015L12.7331 19.469C13.9026 20.8895 14.4873 21.5997 15.1543 21.5084C15.8213 21.417 16.1289 20.5846 16.7439 18.9198L16.9031 18.4891C17.0778 18.0161 17.1652 17.7795 17.3369 17.6078C17.5086 17.4362 17.7451 17.3488 18.2182 17.174L18.6489 17.0149C20.3137 16.3998 21.1461 16.0923 21.2374 15.4253C21.3288 14.7583 20.6185 14.1735 19.1981 13.0041M17.8938 10.5224C17.7532 8.72179 17.6829 7.8215 17.0723 7.5006C16.4618 7.1797 15.7153 7.65071 14.2224 8.59272L13.8361 8.83643C13.4119 9.10412 13.1998 9.23797 12.9554 9.27143C12.7111 9.30488 12.4622 9.23416 11.9644 9.09271L11.5113 8.96394C9.75959 8.46619 8.88375 8.21732 8.41508 8.68599C7.94641 9.15467 8.19528 10.0305 8.69303 11.7822"
                stroke="#fdb212"
                stroke-width="1.5"
                stroke-linecap="round"></path>{' '}
              <path
                d="M13.5 6.5L13 6M9.5 2.5L11.5 4.5"
                stroke="#fdb212"
                stroke-width="1.5"
                stroke-linecap="round"></path>{' '}
              <path
                d="M6.5 6.5L4 4"
                stroke="#fdb212"
                stroke-width="1.5"
                stroke-linecap="round"></path>{' '}
              <path
                d="M6 12L4.5 10.5M2 8L2.5 8.5"
                stroke="#fdb212"
                stroke-width="1.5"
                stroke-linecap="round"></path>{' '}
            </g>
          </svg>
          <h3 className="text-md font-semibold">
            Danh sách đánh giá của công ty
          </h3>
        </div>

        <FinalForm
          onSubmit={(values) => {
            router.replace(
              {
                pathname: router.pathname,
                query: {
                  ...router.query,
                  orderCode: values.orderCode,
                  startDate: values.startDate
                    ? new Date(values.startDate).toDateString()
                    : '',
                  endDate: values.endDate
                    ? new Date(values.endDate).toDateString()
                    : '',
                },
              },
              undefined,
              { shallow: false },
            );
            pageRef.current = 1;
          }}
          initialValues={{
            orderCode,
            startDate,
            endDate,
          }}
          render={(formRenderProps) => {
            const { handleSubmit, invalid, form, values } = formRenderProps;

            return (
              <>
                <Form onSubmit={handleSubmit} className="mb-2">
                  <div className="flex flex-col items-stretch gap-2 w-full">
                    <FieldTextInput
                      placeholder="Nhập mã đơn hàng"
                      id="orderCode"
                      name="orderCode"
                      type="text"
                    />
                    <OrderDateField
                      noMinMax
                      hideQuickSelect
                      allowClear
                      dateRangeNoLimit
                      hideLabel
                      form={form}
                      values={values}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="submit"
                        disabled={invalid}
                        size="small"
                        className="h-[44px] flex-1"
                        variant="primary">
                        <div className="flex items-center gap-1">
                          <span className="text-base">Lọc</span>
                          <svg
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                              {' '}
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7ZM6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12ZM9 17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H10C9.44772 18 9 17.5523 9 17Z"
                                fill="currentColor"></path>{' '}
                            </g>
                          </svg>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        disabled={exporting}
                        inProgress={exporting}
                        className="h-[44px] w-[160px] hover:!text-[#000000] text-[#000000]"
                        onClick={() => {
                          fetchRatings(
                            {
                              ...values,
                              page: 1,
                              perPage: 1000,
                            },
                            'export',
                          ).then((response) => {
                            const ws = xlsx.utils.json_to_sheet(
                              (response || []).map((rating) => ({
                                'Mã đơn hàng': rating.order?.attributes?.title,
                                'Người đánh giá':
                                  rating.reviewer &&
                                  buildFullNameFromProfile(
                                    rating.reviewer.attributes?.profile,
                                  ),
                                'Đánh giá tổng quát':
                                  rating.attributes?.metadata?.generalRating ||
                                  0,
                                'Đánh giá chi tiết':
                                  rating.attributes?.metadata
                                    ?.detailTextRating || '',
                                'Thời gian đánh giá': rating.attributes
                                  ?.metadata?.timestamp
                                  ? format(
                                      new Date(
                                        +(
                                          rating.attributes?.metadata
                                            ?.timestamp || 0
                                        ),
                                      ),
                                      'dd/MM/yyyy',
                                    )
                                  : '',
                              })),
                            );
                            const wb = xlsx.utils.book_new();
                            xlsx.utils.book_append_sheet(wb, ws, 'Ratings');
                            xlsx.writeFile(wb, 'ratings.xlsx');
                          });
                        }}>
                        <Tooltip
                          tooltipContent={'Tối đa 1000 đánh giá gần nhất'}
                          placement="top">
                          <div className="flex items-center gap-1">
                            <span>Xuất danh sách</span>
                            <svg
                              width="16px"
                              height="16px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                              <g
                                id="SVGRepo_tracerCarrier"
                                stroke-linecap="round"
                                stroke-linejoin="round"></g>
                              <g id="SVGRepo_iconCarrier">
                                {' '}
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z"
                                  fill="currentColor"></path>{' '}
                              </g>
                            </svg>
                          </div>
                        </Tooltip>
                      </Button>
                    </div>
                  </div>
                </Form>
                <LoadingWrapper isLoading={inProgress}>
                  {error && <div>{error}</div>}
                  <EmptyWrapper isEmpty={ratings.length === 0}>
                    <div className="flex flex-col w-full">
                      {ratings.map((rating, index) =>
                        rating.reviewer ? (
                          <div
                            key={index}
                            className="shadow-sm p-4 mb-4 bg-white rounded-lg border border-solid border-stone-100 w-full">
                            <div className="flex gap-4">
                              <Avatar
                                user={rating.reviewer}
                                className="w-8 h-8 min-w-8 min-h-8"
                              />

                              <div className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center flex-1">
                                  <div className="text-sm font-semibold">
                                    {buildFullNameFromProfile(
                                      rating.reviewer.attributes?.profile,
                                    )}
                                  </div>

                                  <div className="flex items-center gap-0 ml-[-2px]">
                                    {new Array(
                                      rating.attributes?.metadata?.generalRating,
                                    )
                                      .fill(0)
                                      .map((_, _index) => (
                                        <svg
                                          fill="#ffba42"
                                          key={_index}
                                          width={20}
                                          height={20}
                                          viewBox="0 0 1024 1024"
                                          xmlns="http://www.w3.org/2000/svg">
                                          <g
                                            id="SVGRepo_bgCarrier"
                                            stroke-width="0"></g>
                                          <g
                                            id="SVGRepo_tracerCarrier"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"></g>
                                          <g id="SVGRepo_iconCarrier">
                                            {' '}
                                            <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"></path>{' '}
                                          </g>
                                        </svg>
                                      ))}
                                  </div>
                                </div>

                                {!!rating.images?.length && (
                                  <div className="flex gap-2 flex-wrap">
                                    {rating.images?.map((image, idx) => (
                                      <Image
                                        src={
                                          image?.attributes?.variants?.[
                                            'square-small2x'
                                          ]?.url || ''
                                        }
                                        key={idx}
                                        alt="Hình ảnh đánh giá"
                                        width={100}
                                        height={100}
                                        style={{
                                          borderRadius: '8px',
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}

                                {!!rating.attributes?.metadata?.foodName && (
                                  <p className="text-sm text-stone-700">
                                    {rating.attributes?.metadata?.foodName && (
                                      <span className="text-stone-900 font-semibold">
                                        <span className="text-stone-900">
                                          (Món ăn:&nbsp;
                                        </span>
                                        {rating.attributes?.metadata?.foodName})
                                      </span>
                                    )}
                                    &nbsp;
                                    {!!rating.attributes?.metadata
                                      ?.detailTextRating && (
                                      <span>
                                        {
                                          rating.attributes?.metadata
                                            ?.detailTextRating
                                        }
                                      </span>
                                    )}
                                  </p>
                                )}

                                <span className="text-xs text-stone-500">
                                  #{rating.order?.attributes?.title}&nbsp;&nbsp;
                                  {!!rating.attributes?.metadata?.timestamp &&
                                    format(
                                      new Date(
                                        +(
                                          rating.attributes?.metadata
                                            ?.timestamp || 0
                                        ),
                                      ),
                                      'dd/MM/yyyy',
                                    )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null,
                      )}

                      <LoadingWrapper isLoading={loadingMore}>
                        {canLoadMore && (
                          <div className="flex justify-center">
                            <Button
                              variant="inline"
                              size="small"
                              className="h-[44px]"
                              onClick={() => {
                                pageRef.current += 1;
                                fetchRatings(
                                  {
                                    ...values,
                                    page: pageRef.current,
                                  },
                                  'ui',
                                );
                              }}>
                              Xem thêm
                            </Button>
                          </div>
                        )}
                      </LoadingWrapper>
                    </div>
                  </EmptyWrapper>
                </LoadingWrapper>
              </>
            );
          }}
        />
      </div>
    </MetaWrapper>
  );
}
