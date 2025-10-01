import { useEffect, useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { getCompanyRatingsApi } from '@apis/companyApi';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { type TColumn, TableForm } from '@components/Table/Table';
import OrderDateField from '@pages/company/booker/orders/new/quiz/meal-date/OrderDateField/OrderDateField';
import type { OrderListing, RatingListing, UserListing } from '@src/types';

export interface BookerViewerRatingData {
  data: Array<
    RatingListing & {
      reviewer?: UserListing;
      order?: OrderListing;
    }
  >;
  pagination: {
    totalItems: number;
    totalPages: number;
    page: number;
    perPage: number;
  };
}

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'code',
    label: 'Mã đơn',
    render: ({ code }: any) => {
      return <div>{code}</div>;
    },
  },
  {
    key: 'name',
    label: 'Người đánh giá',
    render: ({ name }: any) => {
      return <div>{name}</div>;
    },
  },
  {
    key: 'rate',
    label: 'Điểm',
    render: ({ rate }: any) => {
      return (
        <div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <span
              key={idx}
              style={{ color: idx < rate ? '#FFD700' : '#E0E0E0' }}>
              ★
            </span>
          ))}
          <span style={{ marginLeft: 8 }}>{rate}</span>
        </div>
      );
    },
  },
  {
    key: 'description',
    label: 'Nội dung đánh giá',
    render: ({ description }: any) => {
      return <div>{description}</div>;
    },
  },
  {
    key: 'date',
    label: 'Ngày đánh giá',
    render: ({ date }: any) => {
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
];

export default function CompanyDetailRoute() {
  const router = useRouter();
  const { companyId } = router.query;
  const { query } = router;
  const { page, perPage, orderCode, startDate, endDate } = query;
  const intl = useIntl();

  const [ratingListing, setRatingListing] = useState<BookerViewerRatingData>({
    data: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
      page: Number(page) || 1,
      perPage: Number(perPage) || 10,
    },
  });

  const pagination = {
    page: Number(page),
    perPage: Number(perPage) || 10,
    totalPages: ratingListing.pagination.totalPages,
    totalItems: ratingListing.pagination.totalItems,
  };

  const [inProgress, setInProgress] = useState<boolean>(true);

  const downloadFile = (
    start: string | number | Date,
    end: string | number | Date,
  ) => {
    fetch(
      `/api/company/${companyId}/ratings/export?JSONParams=${JSON.stringify({
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
      })}`,
    )
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ratings-export.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  };

  // load 5 latest rating listing of current company id
  useEffect(() => {
    if (companyId) {
      setInProgress(true);
      getCompanyRatingsApi(companyId as string, {
        page: Number(page) || 1,
        perPage: Number(perPage) || 10,
        ...(orderCode ? { orderCode: orderCode as string } : {}),
        ...(startDate && endDate
          ? {
              startDate: new Date(startDate as string).toISOString(),
              endDate: new Date(endDate as string).toISOString(),
            }
          : {}),
      })
        .then((response) => setRatingListing(response.data))
        .catch((error) => {
          console.error('Error fetching ratings:', error);
        })
        .finally(() => {
          setInProgress(false);
        });
    }
  }, [companyId as string, page, orderCode, startDate, endDate]);

  if (!companyId) {
    return null;
  }

  const parseToTableData = ratingListing.data.map((rating) => ({
    key: rating.id?.uuid || 'N/A',
    data: {
      id: rating.id?.uuid || 'N/A',
      code: rating.attributes?.metadata?.orderCode || 'N/A',
      name: rating.reviewer?.attributes?.email || 'N/A',
      rate: rating.attributes?.metadata?.generalRating || 'N/A',
      description: rating.attributes?.metadata?.detailTextRating || 'N/A',
      date: rating.attributes?.metadata?.timestamp || 'N/A',
    },
  }));

  return (
    <div className="w-full max-w-[90%] mx-auto py-4">
      {inProgress ? (
        <LoadingContainer />
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {intl.formatMessage({ id: 'danh-sach-danh-gia-cua-cong-ty' })}
          </h2>
          <div className="flex items-center gap-2 justify-start">
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
                      page: 1,
                    },
                  },
                  undefined,
                  { shallow: false },
                );
              }}
              initialValues={{
                orderCode,
                startDate,
                endDate,
              }}
              render={(formRenderProps) => {
                const { handleSubmit, invalid, form, values } = formRenderProps;

                return (
                  <Form onSubmit={handleSubmit} className="mb-2 w-full">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className="flex flex-row items-stretch gap-2">
                        <FieldTextInput
                          placeholder={'Mã đơn hàng'}
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
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <Button
                          type="submit"
                          disabled={invalid}
                          onClick={() => {
                            form.submit();
                          }}>
                          Lọc
                        </Button>
                        <Button
                          type="button"
                          disabled={invalid}
                          onClick={() => {
                            if (values.startDate && values.endDate) {
                              downloadFile(values.startDate, values.endDate);
                            } else {
                              alert(
                                'Vui lòng chọn khoảng thời gian để xuất file',
                              );
                            }
                          }}>
                          Xuất CSV
                        </Button>
                      </div>
                    </div>
                  </Form>
                );
              }}
            />
          </div>
          <TableForm
            columns={TABLE_COLUMN}
            data={parseToTableData}
            pagination={pagination}
            pageSearchParams={query}
            paginationPath={`/company/${companyId}/ratings`}
          />
        </div>
      )}
    </div>
  );
}
