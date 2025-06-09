import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { z } from 'zod';

import { updateDeliveryInfo } from '@apis/planApi';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Skeleton } from '@components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { LoadingWrapper } from '@pages/admin/scanner/[planId]/LoadingWrapper';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { ETransition } from '@src/utils/transaction';
import type { TListing } from '@src/utils/types';

import { TrackingPageThunks } from '../TrackingPage.slice';

import TrackingOrderDetailInfo from './TrackingOrderDetailInfo';

function AppAlertDialog({
  children,
  onConfirm,
}: {
  children: React.ReactNode;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận đã kiểm tra đầy đủ?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn sẽ có thể tải hình ảnh lên sau khi xác nhận. Bạn có chắc chắn
            rằng tất cả các mục trong checklist đều đã được kiểm tra và đầy đủ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={
              onConfirm
                ? () => {
                    onConfirm();
                  }
                : undefined
            }>
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const checkLists = [
  {
    key: 'Đầy đủ theo SỐ LƯỢNG trên PHIẾU VẬN ĐƠN này',
    required: true,
    label: 'Đầy đủ theo SỐ LƯỢNG trên PHIẾU VẬN ĐƠN này',
  },
  {
    key: 'Đủ CƠM THÊM (trừ khách Technify hiện không ăn cơm thêm)',
    required: false,
    label: 'Đủ CƠM THÊM (trừ khách Technify hiện không ăn cơm thêm)',
  },
  {
    key: 'Đủ số lượng CANH THEO CƠM',
    required: true,
    label: 'Đủ số lượng CANH THEO CƠM',
  },
  {
    key: 'Đủ số lượng CANH CHAY (nếu có cơm chay)',
    required: true,
    label: 'Đủ số lượng CANH CHAY (nếu có cơm chay)',
  },
  {
    key: 'Đủ số lượng NƯỚC LÈO',
    required: false,
    label: 'Đủ số lượng NƯỚC LÈO',
  },
  {
    key: 'Đủ TRÁNG MIỆNG',
    required: false,
    label: 'Đủ TRÁNG MIỆNG',
  },
  {
    key: 'Đủ MUỖNG ĐŨA',
    required: true,
    label: 'Đủ MUỖNG ĐŨA',
  },
  {
    key: 'Đủ RAU SỐNG NẾU BẾP CÓ CHO KÈM (như: Hủ tiếu, bò kho,...)',
    required: false,
    label: 'Đủ RAU SỐNG NẾU BẾP CÓ CHO KÈM (như: Hủ tiếu, bò kho,...)',
  },
  {
    key: 'TEM PHỤ ĐÃ DÁN ĐỦ LÊN Tráng miệng, đũa muỗng, canh chay, cơm thêm...',
    required: true,
    label:
      'TEM PHỤ ĐÃ DÁN ĐỦ LÊN Tráng miệng, đũa muỗng, canh chay, cơm thêm...',
  },
];

type TTrackingOrderInfoProps = {
  subOrderDate: number | string;
};

const formSchema = z.object({
  checklist: z
    .array(z.string())
    .refine(
      (checklist) =>
        checkLists
          .filter((item) => item.required)
          .every((item) => checklist.includes(item.key)),
      {
        message: 'Tất cả các mục bắt buộc phải được kiểm tra',
      },
    )
    .optional(),
});

if (typeof document === 'undefined') {
  React.useLayoutEffect = React.useEffect;
}

const TrackingOrderInfo = ({ subOrderDate }: TTrackingOrderInfoProps) => {
  const intl = useIntl();
  const router = useRouter();

  const loadDataInProgress = useAppSelector(
    (state) => state.TrackingPage.loadDataInProgress,
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checklist: [],
    },
  });

  const order = useAppSelector((state) => state.TrackingPage.order);

  const { restaurant } = order || {};
  const orderGetter = Listing(order as TListing);
  const restaurantGetter = Listing(restaurant as TListing);
  const { title: restaurantName } = restaurantGetter.getAttributes();
  const [phoneNumberForDetecting, setPhoneNumberForDetecting] = useState('');
  const { staffName } = orderGetter.getMetadata();
  const {
    contactorName = '',
    phoneNumber = '',
    location = {},
  } = restaurantGetter.getPublicData();
  const [images, setImages] = useState<
    {
      imageUrl?: string;
      state: 'uploaded' | 'uploading';
      imageFile?: File;
      id: string;
    }[]
  >([]);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const customerInfoItems = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.partner' }),
        value: restaurantName,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.phoneNumber' }),
        value: phoneNumber,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.contactorName' }),
        value: contactorName,
      },
      {
        label: intl.formatMessage({ id: 'Tracking.OrderInfo.address' }),
        value: location?.address || '',
      },
    ];
  }, [intl, restaurantName, phoneNumber, contactorName, location?.address]);

  const deliverfyInfoItems = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.deliveryTime' }),
        value: `${formatTimestamp(Number(subOrderDate))}`,
      },
    ];
  }, [intl, subOrderDate]);

  const contactInfoItems = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: 'Tracking.ContactInfo.deliveryManName',
        }),
        value: staffName || '-',
      },
      {
        label: intl.formatMessage({
          id: 'Tracking.ContactInfo.deliveryManPhoneNumber',
        }),
        value: '-',
      },
    ];
  }, [intl, staffName]);

  const { orderDetailOfDate } = order;

  const { orderNote: bookerOrderNote } = orderGetter.getMetadata();
  const { note: bookerSubOrderNote, lastTransition } = orderDetailOfDate || {};

  const isOrderDelivery = lastTransition === ETransition.START_DELIVERY;

  const dispatch = useAppDispatch();

  const {
    query: { subOrderId = '', delivery },
  } = router;

  const [orderId, date] = (String(subOrderId) || '').split('_');

  /**
   * Fetch data
   */
  useEffect(() => {
    if (orderId && date) {
      dispatch(
        TrackingPageThunks.loadData({
          orderId,
          date,
        }),
      );
    }
  }, [orderId, date, dispatch, form]);

  /**
   * If phone number valid, fetch order info
   */
  useEffect(() => {
    const isPhoneNumber =
      phoneNumberForDetecting.startsWith('0') &&
      phoneNumberForDetecting.length >= 10;
    if (isPhoneNumber) {
      dispatch(
        TrackingPageThunks.loadData({
          orderId,
          date,
          phoneNumber: phoneNumberForDetecting,
        }),
      )
        .unwrap()
        .then((res) => {
          form.setValue(
            'checklist',
            res.deliveryInfoOfDate[phoneNumberForDetecting]?.checkList || [],
          );
          if (
            res.deliveryInfoOfDate[phoneNumberForDetecting]?.checkList?.length
          ) {
            setIsFormSubmitted(true);
          } else {
            setIsFormSubmitted(false);
          }

          setImages([
            ...(res.deliveryInfoOfDate[phoneNumberForDetecting]?.images?.map(
              (image: any) => ({
                imageUrl: image.imageUrl,
                state: 'uploaded' as const,
                imageFile: null,
                id: image.imageId,
              }),
            ) || []),
          ]);
        });
    }
  }, [date, dispatch, form, orderId, phoneNumberForDetecting]);

  const onSubmit = (_data: z.infer<typeof formSchema>) => {
    setIsFormSubmitted(true);
    updateDeliveryInfo({
      planId: order?.attributes?.metadata?.plans?.[0],
      deliveryPhoneNumber: phoneNumberForDetecting,
      subOrderTimestamp: String(subOrderDate),
      checkList: _data?.checklist || [],
    }).then(() => {
      toast.success('Cập nhật thành công');
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const formData = new FormData();

    formData.append('planId', order?.attributes?.metadata?.plans?.[0] || '');
    formData.append('subOrderTimestamp', String(subOrderDate));
    formData.append('deliveryPhoneNumber', phoneNumberForDetecting);
    const acceptedFilesWithIds = acceptedFiles.map((file) => ({
      file,
      id: String(Math.random()),
    }));
    const acceptedFilesIds = acceptedFilesWithIds.map((file) => file.id);
    acceptedFilesWithIds.forEach((file) => {
      formData.append('file', file.file);
    });
    setImages((prev) => [
      ...acceptedFilesWithIds.map((file) => ({
        imageUrl: URL.createObjectURL(file.file),
        state: 'uploading' as const,
        imageFile: file.file,
        id: file.id,
      })),
      ...prev,
    ]);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setImages((prev) => [
        ...data.uploadedImage.map((image: any) => ({
          imageUrl: image.imageUrl,
          state: 'uploaded' as const,
          imageFile: null,
          id: image.imageId,
        })),
        ...prev.filter((image) => {
          return !acceptedFilesIds.includes(image.id);
        }),
      ]);
    } catch (error) {
      toast.error(String(error));
      setImages((prev) => {
        return prev.filter((image) => {
          return !acceptedFilesIds.includes(image.id);
        });
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: true,
  });

  const isDeliverier = delivery === 'true';

  const noteSectionShowed = bookerOrderNote || bookerSubOrderNote;
  const numberOfDeliveryAgentsMeals =
    order?.deliveryAgentsMealsOfDate?.numberOfMeals || 0;

  const contactInfoSectionShowed = Object.values(contactInfoItems).some(
    (item) => item.value !== '-',
  );

  const isPhoneNumber =
    phoneNumberForDetecting.startsWith('0') &&
    phoneNumberForDetecting.length >= 10;

  const recieverInfoSection = (
    <Accordion
      type="multiple"
      className="w-full mx-auto border border-solid border-gray-300 rounded-2xl shadow-lg overflow-hidden"
      defaultValue={['customer-info', 'delivery-info', 'contact-info']}>
      <AccordionItem value="customer-info">
        <AccordionTrigger className="bg-gray-100 px-2 font-semibold">
          {intl.formatMessage({
            id: 'Tracking.OrderInfo.title',
          })}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col py-2 gap-2">
          {customerInfoItems.map((ciitem) => (
            <div key={ciitem.label} className="flex justify-between gap-2 my-1">
              <div className="basis-[180px] px-2 shrink-0">
                • {ciitem.label}
              </div>
              <div className="text-right px-2 font-semibold whitespace-pre-wrap">
                {ciitem.value}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="delivery-info">
        <AccordionTrigger className="bg-gray-100 px-2 font-semibold">
          {intl.formatMessage({
            id: 'Tracking.DeliveryInfo.title',
          })}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col py-2 gap-2">
          {deliverfyInfoItems.map((item) => (
            <div key={item.label} className="flex justify-between gap-2 my-1">
              <div className="basis-[180px] px-2 shrink-0">• {item.label}</div>
              <div className="text-right px-2 font-semibold whitespace-pre-wrap">
                {item.value}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
      {contactInfoSectionShowed && (
        <AccordionItem value="contact-info">
          <AccordionTrigger className="bg-gray-100 px-2 font-semibold">
            {intl.formatMessage({
              id: 'Tracking.ContactInfo.title',
            })}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col py-2 gap-2">
            {contactInfoItems.map(({ label, value }, index) => {
              return (
                <div key={index} className="flex justify-between gap-2 my-1">
                  <div className="basis-[180px] px-2 shrink-0">• {label}</div>
                  <div className="text-right px-2 font-semibold whitespace-pre-wrap">
                    {value}
                  </div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );

  const orderDetailInfoSection = (
    <Accordion
      type="multiple"
      className="w-full mx-auto border border-solid border-gray-300 rounded-2xl shadow-lg overflow-hidden"
      defaultValue={['order-detail-info']}>
      <AccordionItem value="order-detail-info">
        <AccordionTrigger className="bg-gray-100 px-2 font-semibold">
          {intl.formatMessage({
            id: 'Tracking.OrderDetailInfo.title',
          })}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col py-2 gap-2">
          <TrackingOrderDetailInfo subOrderDate={subOrderDate} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const deliveryAgentsMealsSection = (
    <Accordion
      type="multiple"
      className="w-full mx-auto border border-solid border-blue-300 rounded-2xl shadow-lg overflow-hidden"
      defaultValue={['order-note', 'check-list']}>
      <AccordionItem value="order-note">
        <AccordionTrigger className="bg-blue-100 px-2 font-semibold">
          DELIVERY AGENT MEALS
        </AccordionTrigger>
        <AccordionContent className="flex flex-col p-2 gap-2">
          <div className="flex items-center gap-2 text-blue-500 font-semibold">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width={24}
              height={24}
              xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                {' '}
                <path
                  d="M12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75Z"
                  fill="currentColor"></path>{' '}
                <path
                  d="M12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z"
                  fill="currentColor"></path>{' '}
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12ZM12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z"
                  fill="currentColor"></path>{' '}
              </g>
            </svg>
            <span>
              Số lượng phần ăn đối tác cung cấp cho nhân viên giao hàng:{' '}
              {numberOfDeliveryAgentsMeals}
            </span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="flex flex-col gap-4 mx-auto w-[calc(100%)] md:w-[600px]">
      {isDeliverier && (
        <Input
          className="w-full bg-white border p-8 border-solid border-gray-900 rounded-lg text-center"
          placeholder="Nhập số điện thoại tài xế"
          value={phoneNumberForDetecting}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            setPhoneNumberForDetecting(value);
          }}
        />
      )}

      <LoadingWrapper isLoading={loadDataInProgress}>
        {isDeliverier && isPhoneNumber && (
          <>
            {(noteSectionShowed || isDeliverier) && (
              <Accordion
                type="multiple"
                className="w-full mx-auto border border-solid border-gray-300 rounded-2xl shadow-lg overflow-hidden"
                defaultValue={['order-note', 'check-list']}>
                {noteSectionShowed && (
                  <AccordionItem value="order-note">
                    <AccordionTrigger className="bg-gray-100 px-2 font-semibold">
                      GHI CHÚ
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col py-2 gap-2">
                      {bookerOrderNote && (
                        <div className="flex flex-col gap-2 my-1 mx-2">
                          <div className="shrink-0 text-blue-700 font-semibold">
                            • Ghi chú đơn hàng
                          </div>
                          <div className="whitespace-pre-wrap">
                            {bookerOrderNote}
                          </div>
                        </div>
                      )}
                      {bookerSubOrderNote && (
                        <div className="flex flex-col gap-2 my-1 mx-2">
                          <div className="shrink-0 text-blue-700 font-semibold">
                            • Ghi chú ngày ăn
                          </div>
                          <div className="whitespace-pre-wrap">
                            {bookerSubOrderNote}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {isDeliverier && !isOrderDelivery && (
                  <AccordionItem value="check-list">
                    <AccordionTrigger className="bg-gray-100 px-2 font-semibold">
                      CHECK LIST
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col py-2 gap-2 px-2 bg-gray-100">
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="gap-4 flex flex-col">
                          <FormField
                            control={form.control}
                            name="checklist"
                            render={({ field }) => (
                              <FormItem className="flex gap-1 items-center flex-wrap">
                                {checkLists
                                  .sort(
                                    (a, b) =>
                                      Number(b.required) - Number(a.required),
                                  )
                                  .map(({ key, label, required }) => {
                                    const handleChange = () => {
                                      if (!field.value?.includes(key)) {
                                        field.onChange([
                                          ...(field.value || []),
                                          key,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter(
                                            (item) => item !== key,
                                          ),
                                        );
                                      }
                                    };

                                    const emoji = field.value?.includes(key)
                                      ? '✅'
                                      : '❌';
                                    const backgroundColor =
                                      field.value?.includes(key)
                                        ? 'bg-green-100 hover:bg-green-100 border-green-500'
                                        : 'bg-white hover:bg-blue-50 border-blue-500';

                                    return (
                                      <Badge
                                        key={key}
                                        variant="secondary"
                                        className={classNames(
                                          'cursor-pointer bg-white inline-block rounded-full p-2',
                                          backgroundColor,
                                        )}
                                        onClick={handleChange}>
                                        {emoji}&nbsp;&nbsp;
                                        {required ? (
                                          <span className="text-red-500">
                                            (Bắt buộc)&nbsp;
                                          </span>
                                        ) : null}
                                        {label}
                                      </Badge>
                                    );
                                  })}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <p className="text-xs text-gray-500 mb-2">
                              Bằng việc ấn Xác nhận, bạn đã xác nhận rằng tất cả
                              các mục trong checklist đều đã được kiểm tra và
                              đầy đủ.
                            </p>
                            <AppAlertDialog
                              onConfirm={() => {
                                form.handleSubmit(onSubmit)();
                              }}>
                              <Button
                                className="w-full rounded-full"
                                disabled={isFormSubmitted}
                                variant="default">
                                {isFormSubmitted ? 'Đã xác nhận' : 'Xác nhận'}
                              </Button>
                            </AppAlertDialog>
                          </div>
                        </form>
                      </Form>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            )}

            {(isFormSubmitted || isOrderDelivery) && (
              <>
                <div
                  {...getRootProps()}
                  className="border-2 !border-dashed !border-gray-400 p-4 rounded-md cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex items-center justify-center">
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#000000">
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        {' '}
                        <g>
                          {' '}
                          <path fill="none" d="M0 0h24v24H0z"></path>{' '}
                          <path d="M21 15v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm.008-12c.548 0 .992.445.992.993V13h-2V5H4v13.999L14 9l3 3v2.829l-3-3L6.827 19H14v2H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016zM8 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"></path>{' '}
                        </g>{' '}
                      </g>
                    </svg>
                    &nbsp;&nbsp;
                    <p className="text-sm">Thêm ảnh</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-center">
                  {images.map((image) => {
                    return (
                      <div
                        className="flex items-center justify-center relative w-[calc(33%-8px)]"
                        key={image.id}>
                        <img
                          src={image.imageUrl}
                          alt="preview"
                          className="w-full inline-block aspect-square object-cover rounded-md"
                        />
                        {image.state === 'uploading' && (
                          <Skeleton className="z-10 absolute top-0 left-0 rounded-md w-full h-full bg-blue-100 flex items-center justify-center text-sm">
                            Đang tải lên
                          </Skeleton>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {recieverInfoSection}
            {orderDetailInfoSection}
          </>
        )}
        {!isDeliverier && (
          <>
            {noteSectionShowed && (
              <Accordion
                type="multiple"
                className="w-full mx-auto border border-solid border-gray-300 rounded-2xl shadow-lg overflow-hidden"
                defaultValue={['order-note', 'check-list']}>
                <AccordionItem value="order-note">
                  <AccordionTrigger className="bg-gray-100 px-2 font-semibold">
                    GHI CHÚ
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col py-2 gap-2">
                    {bookerOrderNote && (
                      <div className="flex flex-col gap-2 my-1 mx-2">
                        <div className="shrink-0 text-blue-700 font-semibold">
                          • Ghi chú đơn hàng
                        </div>
                        <div className="whitespace-pre-wrap">
                          {bookerOrderNote}
                        </div>
                      </div>
                    )}
                    {bookerSubOrderNote && (
                      <div className="flex flex-col gap-2 my-1 mx-2">
                        <div className="shrink-0 text-blue-700 font-semibold">
                          • Ghi chú ngày ăn
                        </div>
                        <div className="whitespace-pre-wrap">
                          {bookerSubOrderNote}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {recieverInfoSection}
            {!!numberOfDeliveryAgentsMeals && deliveryAgentsMealsSection}
            {orderDetailInfoSection}
          </>
        )}
      </LoadingWrapper>
    </div>
  );
};

export default TrackingOrderInfo;
