import React, { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'react-toastify';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import vi from 'date-fns/locale/vi';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

import {
  getAllDeliveryAgentsMealsApi,
  setDeliveryAgentsMealsApi,
} from '@apis/delivery-agents-meals';
import { DeliveryAgentsMealsInputField } from '@components/DeliveryAgentsMealsInputField';
import { cn } from '@components/lib/utils';
import { Button } from '@components/ui/button';
import { Calendar } from '@components/ui/calendar';
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import type { GETDeliveryAgentsMealsQuery } from '@pages/api/admin/delivery-agents-meals/index.api';
import { enGeneralPaths } from '@src/paths';
import type { OrderListing, PlanListing } from '@src/types';

import { EmptyWrapper } from '../scanner/[planId]/EmptyWrapper';
import { LoadingWrapper } from '../scanner/[planId]/LoadingWrapper';

function DatePickerWithRange({
  className,
  date,
  setDate,
}: React.HTMLAttributes<HTMLDivElement> & {
  date?: DateRange;
  setDate: (date?: DateRange) => void;
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}>
            <CalendarIcon />
            {date?.from ? (
              date?.to ? (
                <>
                  {format(date?.from, 'dd/MM/yyyy')} -{' '}
                  {format(date?.to, 'dd/MM/yyyy')}
                </>
              ) : (
                format(date?.from, 'dd/MM/yyyy')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-10 bg-white" align="start">
          <Calendar
            className="border border-solid border-red"
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
const DeliveryAgentsMealsSettingDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [ordersWithPlanData, setOrdersWithPlanData] = useState<
    (OrderListing & {
      plan: PlanListing;
    })[]
  >([]);

  const [date, setDate] = useState<DateRange | undefined>();
  const [orderCode, setOrderCode] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [needFetchUsingFilterOptions, setFetchUsingFilterOptionsKey] =
    useState(0);
  const [isLoadingExport, setIsLoadingExport] = useState(false);

  const getAllDeliveryAgentsMeals = useCallback(
    async ({
      page: _page = 1,
      perPage = 20,
      filterBy,
    }: GETDeliveryAgentsMealsQuery) => {
      if (_page > 1) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const reponse = await getAllDeliveryAgentsMealsApi({
          page: _page,
          perPage,
          filterBy,
        });
        const deligeryAgentsMeals = reponse.data || [];

        if (_page === 1) {
          setOrdersWithPlanData(deligeryAgentsMeals);
        } else {
          setOrdersWithPlanData((prev) => [...prev, ...deligeryAgentsMeals]);
        }

        setCanLoadMore(deligeryAgentsMeals.length >= perPage);
      } catch (error) {
        toast.error('Failed to fetch delivery agents meals');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  const resetState = () => {
    setOrdersWithPlanData([]);
    setPage(1);
    setCanLoadMore(true);
  };

  /**
   * Refetch data when submit button is clicked
   */
  useEffect(() => {
    getAllDeliveryAgentsMeals({
      page,
      filterBy: {
        orderCode,
        startDate: date?.from?.toISOString(),
        endDate: date?.to?.toISOString(),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needFetchUsingFilterOptions, page]);

  /**
   * Reset page when dialog is closed
   */
  useEffect(() => {
    if (!isDialogOpen) {
      resetState();
    } else {
      // refetch data when dialog is opened
      setFetchUsingFilterOptionsKey((prev) => prev + 1);
    }
  }, [isDialogOpen]);

  const loopToExportDeliveryAgentsMeals = async () => {
    setIsLoadingExport(true);

    let isDone = false;
    let currentPage = 1;
    const perPage = 100;
    const ordersWithPlanDataToExport: (OrderListing & {
      plan?: PlanListing;
    })[] = [];

    while (!isDone) {
      // eslint-disable-next-line no-await-in-loop
      const response = await getAllDeliveryAgentsMealsApi({
        page: currentPage,
        perPage,
        filterBy: {
          orderCode,
          startDate: date?.from?.toISOString(),
          endDate: date?.to?.toISOString(),
        },
      });

      const deligeryAgentsMeals = response.data || [];

      if (deligeryAgentsMeals.length === 0) {
        isDone = true;
      } else {
        ordersWithPlanDataToExport.push(...deligeryAgentsMeals);
        currentPage += 1;
      }
      if (deligeryAgentsMeals.length < perPage) {
        isDone = true;
      }
    }

    if (ordersWithPlanDataToExport.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      setIsLoadingExport(false);

      return;
    }

    const sumTotalByRestaurantName: Record<string, number> = {};

    ordersWithPlanDataToExport.forEach((order) => {
      const deliveryAgentsMeals =
        order.plan?.attributes?.metadata?.deliveryAgentsMeals || {};

      Object.entries(deliveryAgentsMeals).forEach(([_timestamp, value]) => {
        const restaurantName =
          order.plan?.attributes?.metadata?.orderDetail?.[_timestamp]
            ?.restaurant?.restaurantName || 'Unknown';

        if (sumTotalByRestaurantName[restaurantName]) {
          sumTotalByRestaurantName[restaurantName] += value?.numberOfMeals || 0;
        } else {
          sumTotalByRestaurantName[restaurantName] = value?.numberOfMeals || 0;
        }
      });
    });

    const dataToExport = Object.entries(sumTotalByRestaurantName).map(
      ([restaurantName, numberOfMeals]) => ({
        'Tên nhà hàng': restaurantName,
        'Số lượng phần ăn': numberOfMeals,
      }),
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-agents-meals-${format(
      new Date(),
      'dd-MM-yyyy',
    )}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    setIsLoadingExport(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className={`relative`}>
          <Button className="h-[48px]" type="button">
            Phần ăn DAs
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white max-w-fit w-fit h-[60vh] overflow-y-auto">
        <div className="w-[1200px]">
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Input
                placeholder="Mã đơn"
                className="w-[200px] border rounded-lg border-solid flex-1"
                value={orderCode}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setFetchUsingFilterOptionsKey((prev) => prev + 1);
                  }
                }}
                onChange={(e) => {
                  setOrderCode(e.target.value);
                }}></Input>
              <Button
                variant="outline"
                className="w-[120px] border rounded-lg border-solid"
                onClick={() =>
                  setDate({
                    from: startOfWeek(new Date(), {
                      weekStartsOn: 1,
                    }),
                    to: endOfWeek(new Date(), {
                      weekStartsOn: 1,
                    }),
                  })
                }>
                Tuần này
              </Button>
              <Button
                variant="outline"
                className="w-[120px] border rounded-lg border-solid"
                onClick={() =>
                  setDate({
                    from: startOfWeek(addDays(new Date(), 7), {
                      weekStartsOn: 1,
                    }),
                    to: endOfWeek(addDays(new Date(), 7), {
                      weekStartsOn: 1,
                    }),
                  })
                }>
                Tuần sau
              </Button>
              <DatePickerWithRange
                date={date}
                setDate={setDate}
                className="border rounded-lg border-solid"
              />
            </div>

            <div className="flex flex-row items-center gap-2 justify-end">
              <Button
                className="w-[120px]"
                onClick={() => {
                  setFetchUsingFilterOptionsKey((prev) => prev + 1);
                  resetState();
                }}>
                Lọc
              </Button>
              <Button
                disabled={isLoadingExport}
                onClick={() => {
                  loopToExportDeliveryAgentsMeals();
                }}>
                {isLoadingExport ? 'Đang xuất...' : 'Xuất danh sách'}
              </Button>
            </div>
          </div>

          <LoadingWrapper isLoading={isLoading}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px]">STT</TableHead>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead className="w-[240px]">Khách hàng</TableHead>
                  <TableHead>Phần ăn DAs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersWithPlanData?.map((order, index) => (
                  <TableRow key={order.id?.uuid}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-semibold">
                      <Link
                        href={enGeneralPaths.admin.order['[orderId]'].index(
                          order.id?.uuid!,
                        )}
                        className="text-blue-500 hover:underline">
                        #{order.attributes?.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {order.attributes?.metadata?.companyName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-row gap-4 flex-wrap">
                        {Object.entries(
                          order.plan?.attributes?.metadata?.orderDetail || [],
                        ).map(([_timestamp, value]) => {
                          const _value =
                            order.plan?.attributes?.metadata
                              ?.deliveryAgentsMeals?.[_timestamp]
                              ?.numberOfMeals || 0;

                          return (
                            <DeliveryAgentsMealsInputField
                              key={_timestamp}
                              label={format(
                                new Date(+_timestamp),
                                'dd/MM/yyyy',
                              )}
                              defaultValue={_value || ''}
                              onChange={(newValue) => {
                                if (!order.plan?.id?.uuid) return;

                                setDeliveryAgentsMealsApi({
                                  planId: order.plan?.id?.uuid,
                                  timestamp: _timestamp,
                                  numberOfMeals: +newValue,
                                  restaurantId: value?.restaurant?.id,
                                  restaurantName:
                                    value?.restaurant?.restaurantName,
                                }).catch((error) => {
                                  toast.error(`Có lỗi xảy ra: ${error}`, {
                                    position: 'top-right',
                                  });
                                });
                              }}
                              description={value?.restaurant?.restaurantName}
                              loading={false}
                              disabled={false}
                            />
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <EmptyWrapper
              isEmpty={
                !ordersWithPlanData?.length && !isLoading && !isLoadingMore
              }>
              <LoadingWrapper isLoading={isLoadingMore}>
                {canLoadMore && (
                  <div className="w-full flex items-center justify-center mt-4">
                    <Button
                      variant="ghost"
                      className="w-[120px] text-blue-500"
                      onClick={() => {
                        setPage((prev) => prev + 1);
                      }}>
                      Xem thêm
                    </Button>
                  </div>
                )}
              </LoadingWrapper>
            </EmptyWrapper>
          </LoadingWrapper>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryAgentsMealsSettingDialog;
