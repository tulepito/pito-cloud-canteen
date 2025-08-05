import React, { useEffect, useMemo, useState } from 'react';
import { PiQrCode } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import {
  groupPickingOrderByFood,
  groupPickingOrderByFoodLevels,
} from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { enGeneralPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

// eslint-disable-next-line import/no-cycle
import { EPartnerSubOrderDetailPageViewMode } from '../PartnerSubOrderDetail.page';

import css from './SubOrderQrCode.module.scss';

type TSubOrderQrCodeProps = {
  onChangeViewMode: (v: EPartnerSubOrderDetailPageViewMode) => () => void;
};

const SubOrderQrCode: React.FC<TSubOrderQrCodeProps> = ({
  onChangeViewMode,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const { isMobileLayout } = useViewport();

  const fetchOrderInProgress = useAppSelector(
    (state) => state.PartnerSubOrderDetail.fetchOrderInProgress,
  );
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);

  const groups = useMemo(
    () => order?.company?.attributes?.profile?.metadata?.groups || [],
    [order?.company?.attributes?.profile?.metadata?.groups],
  );

  const isHasGroups = groups.length > 0;

  const {
    query: { subOrderId = '' },
  } = router;
  const [, date] = (subOrderId as string).split('_');
  const timestamp = date ? Number(date) : undefined;

  const { plan, participants = [], anonymous = [] } = order;
  const planGetter = Listing(plan as TListing);
  const { orderDetail = {} } = planGetter.getMetadata();
  const planId = planGetter.getId();

  const orderDetailOfDate = useMemo(() => {
    if (!timestamp) return {};

    const orderDetailForDate = orderDetail[timestamp];
    if (!orderDetailForDate) return {};

    return {
      ...orderDetailForDate,
      notes: orderDetailForDate?.notes?.map((note: TObject) => ({
        ...note,
        barcode: note.barcode || '',
      })),
    };
  }, [orderDetail, timestamp]);

  const { groupedData, groupedDataLevels } = useMemo(() => {
    const orderDetailForDate = { [`${timestamp}`]: orderDetailOfDate };

    const [groupedDataValue] = groupPickingOrderByFood({
      orderDetail: orderDetailForDate,
      date: timestamp,
      participants,
      anonymous,
      planId,
    }) || [{}];

    const [groupedDataLevelsValue] = groupPickingOrderByFoodLevels({
      orderDetail: orderDetailForDate,
      date: timestamp,
      participants,
      anonymous,
      groups,
      planId,
    }) || [{}];

    return {
      groupedData: groupedDataValue,
      groupedDataLevels: groupedDataLevelsValue,
    };
  }, [timestamp, orderDetailOfDate, participants, anonymous, planId, groups]);

  const { foodDataList = [] } = groupedData || {};
  const { foodDataList: foodDataListNullLevel = [], dataOfGroups = [] } =
    groupedDataLevels || {};
  const [isCollapsed, setIsCollapsed] = useState<boolean[]>([]);

  useEffect(() => {
    setIsCollapsed(Array(foodDataList.length).fill(false));
  }, [foodDataList.length]);

  const handleToggleCollapse = (index: number) => () => {
    setIsCollapsed((prev) =>
      prev.map((state, i) => (i === index ? !state : state)),
    );
  };

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    toast.success(`Đã copy barcode: ${barcode}`);
  };

  const handleDownloadQRCode = async ({
    groupId,
    screen,
  }: {
    groupId?: string;
    screen?: string;
  }) => {
    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_CANONICAL_URL}/qrcode`;
      const queryParams = new URLSearchParams();

      if (order?.company?.id?.uuid)
        queryParams.append('companyId', order?.company?.id?.uuid);
      if (groupId) queryParams.append('groupId', groupId);
      if (screen) queryParams.append('screen', screen);

      const dataToEncode = queryParams.toString()
        ? `${baseUrl}?${queryParams.toString()}`
        : baseUrl;
      const canvas = document.createElement('canvas');

      // Tạo QR code trong canvas
      await QRCode.toCanvas(canvas, dataToEncode, { width: 256 });

      // Tạo link download
      const imageUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUrl;
      downloadLink.download = 'qr-code.png';
      downloadLink.click();
    } catch (error) {
      console.error('Lỗi tạo QR Code:', error);
    }
  };

  const scanUrl = useMemo(
    () =>
      enGeneralPaths.partner.scanner['[planId]']['[timestamp]'].index(
        String(planId),
        date,
      ),
    [planId, date],
  );

  const renderTableRowGroup = (foodData: TObject, foodIndex: number) => {
    const { foodName, notes } = foodData;

    const groupTitleClasses = classNames(css.groupTitle, {
      [css.collapsed]: isCollapsed[foodIndex],
    });

    const rowsClasses = classNames(css.rows, {
      [css.collapsed]: isCollapsed[foodIndex],
    });

    return (
      <div className={css.tableRowGroup} key={foodIndex}>
        <div className={groupTitleClasses}>
          <div>{foodIndex + 1}</div>
          <div className="flex-1">{foodName}</div>
          <RenderWhen condition={!isMobileLayout}>
            <div className="flex-1" />
          </RenderWhen>
          <div
            className={css.actionCell}
            onClick={handleToggleCollapse(foodIndex)}>
            <IconArrow
              className={classNames({ [css.reversed]: isCollapsed[foodIndex] })}
            />
          </div>
        </div>
        <div className={rowsClasses}>
          {notes.map(({ note, name, barcode }: TObject, noteIndex: number) => (
            <div className={css.row} key={noteIndex}>
              <div>{`${foodIndex + 1}.${noteIndex + 1}`}</div>
              <div className="flex-1">{name}</div>
              <div title={note} className="flex-1">
                <Tooltip tooltipContent="Ấn để copy" placement="top">
                  <div
                    className="w-fit text-sm flex items-center gap-2 transition-transform cursor-pointer"
                    onClick={() => handleCopyBarcode(barcode)}>
                    <svg
                      width="16px"
                      height="16px"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11.1 22.75H6.9C2.99 22.75 1.25 21.01 1.25 17.1V12.9C1.25 8.99 2.99 7.25 6.9 7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V17.1C16.75 21.01 15.01 22.75 11.1 22.75ZM6.9 8.75C3.8 8.75 2.75 9.8 2.75 12.9V17.1C2.75 20.2 3.8 21.25 6.9 21.25H11.1C14.2 21.25 15.25 20.2 15.25 17.1V12.9C15.25 9.8 14.2 8.75 11.1 8.75H6.9V8.75Z"
                        fill="currentColor"
                      />
                      <path
                        d="M17.1 16.75H16C15.59 16.75 15.25 16.41 15.25 16V12.9C15.25 9.8 14.2 8.75 11.1 8.75H8C7.59 8.75 7.25 8.41 7.25 8V6.9C7.25 2.99 8.99 1.25 12.9 1.25H17.1C21.01 1.25 22.75 2.99 22.75 6.9V11.1C22.75 15.01 21.01 16.75 17.1 16.75ZM16.75 15.25H17.1C20.2 15.25 21.25 14.2 21.25 11.1V6.9C21.25 3.8 20.2 2.75 17.1 2.75H12.9C9.8 2.75 8.75 3.8 8.75 6.9V7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V15.25Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>{barcode}</span>
                  </div>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderComponentQRCode = (groupId?: string) => {
    return (
      <div className="flex gap-2 items-center divide-x divide-gray-300">
        {[
          {
            title: 'Màn hình 1',
            id: 'A',
          },
          // {
          //   title: 'Màn hình 2',
          //   id: 'B',
          // },
        ].map((item) => {
          return (
            <div
              className={clsx(
                'flex gap-2 items-center',
                item.id === 'B' && 'pl-2',
              )}
              key={item.id}>
              <Tooltip tooltipContent="Tải mã QR" placement="top">
                <PiQrCode
                  className="size-[20px] text-blue-600 cursor-pointer transition-all"
                  onClick={() =>
                    handleDownloadQRCode({
                      groupId,
                      screen: item.id,
                    })
                  }
                />
              </Tooltip>
              <Link
                href={`${enGeneralPaths.admin.scanner['[planId]'][
                  '[timestamp]'
                ].index(String(planId), groupId || '')}?screen=${item.id}`}
                legacyBehavior>
                <a target="_blank">
                  <Button variant="inline" size="small" className="!px-1">
                    <div className="flex items-center gap-1 text-blue-500">
                      <span>Mở trang scan {item.title}</span>
                      <svg
                        fill="currentColor"
                        viewBox="0 0 32 32"
                        width="20px"
                        height="20px"
                        xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                          <path d="M23.5 23.5h-15v-15h4.791V6H6v20h20v-7.969h-2.5z"></path>
                          <path d="M17.979 6l3.016 3.018-6.829 6.829 1.988 1.987 6.83-6.828L26 14.02V6z"></path>
                        </g>
                      </svg>
                    </div>
                  </Button>
                </a>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <RenderWhen condition={!fetchOrderInProgress}>
      <div className={css.root}>
        <div className={css.goBackBtnWrapper}>
          <Button
            variant="inline"
            className={css.goBackBtn}
            onClick={onChangeViewMode(
              EPartnerSubOrderDetailPageViewMode.summary,
            )}>
            <IconArrow direction="left" className={css.arrowIcon} />
            <span className={css.goBackText}>
              {intl.formatMessage({ id: 'SubOrderDetail.goBackToSummary' })}
            </span>
          </Button>
        </div>

        <div className={css.actionContainer}>
          <div className={css.title}>
            {intl.formatMessage({ id: 'danh-sach-ma-code-cua-don-hang' })}
          </div>
          {!isHasGroups && (
            <div className="flex flex-row gap-4 items-center">
              <Button
                variant="secondary"
                className={css.ctaButton}
                onClick={() =>
                  handleDownloadQRCode({
                    groupId: undefined,
                  })
                }>
                <PiQrCode size={20} />
                {intl.formatMessage({ id: 'tai-ma-qr' })}
              </Button>
              <Link href={scanUrl} legacyBehavior>
                <a target="_blank">
                  <Button
                    variant="primary"
                    loadingMode="extend"
                    className={css.ctaButton}>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 32 32"
                      width="20px"
                      height="20px"
                      xmlns="http://www.w3.org/2000/svg">
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <path d="M23.5 23.5h-15v-15h4.791V6H6v20h20v-7.969h-2.5z"></path>
                        <path d="M17.979 6l3.016 3.018-6.829 6.829 1.988 1.987 6.83-6.828L26 14.02V6z"></path>
                      </g>
                    </svg>
                    {intl.formatMessage({ id: 'mo-trang-scan' })}
                  </Button>
                </a>
              </Link>
            </div>
          )}
        </div>

        <div className={css.tableContainer}>
          <div className={css.tableHead}>
            <div className="whitespace-nowrap md:min-w-[5%]">
              {intl.formatMessage({ id: 'SubOrderDetail.tableHead.no' })}
            </div>
            <div className="flex-1">
              {intl.formatMessage({ id: 'SubOrderDetail.tableHead.foodType' })}
            </div>
            <div className="flex-1">
              {intl.formatMessage({ id: 'ma-code' })}
            </div>
            <div />
          </div>
          <div className={css.tableHeadMobile}>
            <div>
              {intl.formatMessage({ id: 'SubOrderDetail.tableHead.no' })}
            </div>
            <div>
              {intl.formatMessage({ id: 'SubOrderDetail.tableHead.foodType' })}
            </div>
            <div />
          </div>

          <div className={css.tableBody}>
            {isHasGroups ? (
              <>
                {dataOfGroups?.map((group: TObject, groupIndex: number) => {
                  const {
                    foodDataList: foodDataListGroup = [],
                    name: groupName = '',
                  } = group || {};

                  const totalFoodInGroup = foodDataListGroup.reduce(
                    (total: number, item: TObject) =>
                      total + (item.frequency || 1),
                    0,
                  );

                  const groupTitleClasses = classNames(css.groupTitle, {
                    [css.collapsed]: isCollapsed[groupIndex],
                  });

                  const rowsClasses = classNames(css.rows, {
                    [css.collapsed]: isCollapsed[groupIndex],
                  });

                  return (
                    <div className={css.tableRowGroup} key={groupIndex}>
                      <div className={clsx(css.tableHead, '!bg-neutral-300')}>
                        <div className="md:min-w-[5%] text-black">
                          {groupName}
                        </div>
                        <div className="flex-1 text-black">
                          Số lượng: {totalFoodInGroup}
                        </div>
                        {totalFoodInGroup ? (
                          <div className="flex-1">
                            {renderComponentQRCode(group?.id)}
                          </div>
                        ) : (
                          <div className="flex-1"></div>
                        )}

                        <div
                          className={css.actionCell}
                          onClick={handleToggleCollapse(groupIndex)}>
                          <IconArrow
                            className={classNames({
                              [css.reversed]: isCollapsed[groupIndex],
                            })}
                          />
                        </div>
                      </div>
                      <div
                        className={clsx(
                          css.tableHeadMobile,
                          '!bg-neutral-300 !rounded-none !justify-between',
                        )}>
                        <div className="md:min-w-[5%] text-black">
                          {groupName}
                        </div>
                        <div className="flex-1 text-black">
                          Số lượng: {totalFoodInGroup}
                        </div>
                        {totalFoodInGroup ? (
                          <div className="flex-1">
                            {renderComponentQRCode(group?.id)}
                          </div>
                        ) : (
                          <div className="flex-1"></div>
                        )}
                        <div />
                      </div>
                      {foodDataListGroup.map(
                        (foodData: TObject, foodIndex: number) => {
                          const { foodName, notes = [] } = foodData;

                          return (
                            <React.Fragment key={foodIndex}>
                              <div className={groupTitleClasses}>
                                <div className="md:min-w-[5%]">
                                  {foodIndex + 1}
                                </div>
                                <div className="flex-1">{foodName}</div>
                                <RenderWhen condition={!isMobileLayout}>
                                  <div className="flex-1" />
                                </RenderWhen>
                                <div
                                  className={css.actionCell}
                                  onClick={handleToggleCollapse(foodIndex)}>
                                  <IconArrow
                                    className={classNames({
                                      [css.reversed]: isCollapsed[foodIndex],
                                    })}
                                  />
                                </div>
                              </div>
                              <div className={rowsClasses}>
                                {notes.map(
                                  (
                                    { note, name, barcode }: TObject,
                                    noteIndex: number,
                                  ) => (
                                    <div className={css.row} key={noteIndex}>
                                      <div className="md:min-w-[5%]">{`${
                                        foodIndex + 1
                                      }.${noteIndex + 1}`}</div>
                                      <div className="flex-1">{name}</div>
                                      <div title={note} className="flex-1">
                                        <Tooltip
                                          tooltipContent="Ấn để copy"
                                          placement="top">
                                          <div
                                            className="w-fit text-sm flex items-center gap-2 transition-transform cursor-pointer"
                                            onClick={() =>
                                              handleCopyBarcode(barcode)
                                            }>
                                            <svg
                                              width="16px"
                                              height="16px"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                              xmlns="http://www.w3.org/2000/svg">
                                              <path
                                                d="M11.1 22.75H6.9C2.99 22.75 1.25 21.01 1.25 17.1V12.9C1.25 8.99 2.99 7.25 6.9 7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V17.1C16.75 21.01 15.01 22.75 11.1 22.75ZM6.9 8.75C3.8 8.75 2.75 9.8 2.75 12.9V17.1C2.75 20.2 3.8 21.25 6.9 21.25H11.1C14.2 21.25 15.25 20.2 15.25 17.1V12.9C15.25 9.8 14.2 8.75 11.1 8.75H6.9V8.75Z"
                                                fill="currentColor"
                                              />
                                              <path
                                                d="M17.1 16.75H16C15.59 16.75 15.25 16.41 15.25 16V12.9C15.25 9.8 14.2 8.75 11.1 8.75H8C7.59 8.75 7.25 8.41 7.25 8V6.9C7.25 2.99 8.99 1.25 12.9 1.25H17.1C21.01 1.25 22.75 2.99 22.75 6.9V11.1C22.75 15.01 21.01 16.75 17.1 16.75ZM16.75 15.25H17.1C20.2 15.25 21.25 14.2 21.25 11.1V6.9C21.25 3.8 20.2 2.75 17.1 2.75H12.9C9.8 2.75 8.75 3.8 8.75 6.9V7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V15.25Z"
                                                fill="currentColor"
                                              />
                                            </svg>
                                            <span>{barcode}</span>
                                          </div>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </React.Fragment>
                          );
                        },
                      )}
                    </div>
                  );
                })}
                {foodDataListNullLevel?.length > 0 && (
                  <>
                    <div className={css.tableRowGroup}>
                      <div className={clsx(css.tableHead, '!bg-neutral-300')}>
                        <div className="md:min-w-[5%] text-black">
                          Không có nhóm
                        </div>
                        <div className="flex-1 text-black">
                          Số lượng: {foodDataListNullLevel?.length}
                        </div>
                        <div className="flex-1">{renderComponentQRCode()}</div>
                        <div
                          className={css.actionCell}
                          onClick={handleToggleCollapse(dataOfGroups?.length)}>
                          <IconArrow
                            className={classNames({
                              [css.reversed]: isCollapsed[dataOfGroups?.length],
                            })}
                          />
                        </div>
                      </div>
                      {foodDataListNullLevel?.map(
                        (foodData: TObject, foodIndex: number) => {
                          const { foodName, notes = [] } = foodData;

                          const groupTitleClasses = classNames(css.groupTitle, {
                            [css.collapsed]: isCollapsed[foodIndex],
                          });

                          const rowsClasses = classNames(css.rows, {
                            [css.collapsed]: isCollapsed[foodIndex],
                          });

                          return (
                            <React.Fragment key={foodIndex}>
                              <div className={groupTitleClasses}>
                                <div className="md:min-w-[5%]">
                                  {foodIndex + 1}
                                </div>
                                <div className="flex-1">{foodName}</div>
                                <RenderWhen condition={!isMobileLayout}>
                                  <div className="flex-1" />
                                </RenderWhen>
                                <div
                                  className={css.actionCell}
                                  onClick={handleToggleCollapse(foodIndex)}>
                                  <IconArrow
                                    className={classNames({
                                      [css.reversed]: isCollapsed[foodIndex],
                                    })}
                                  />
                                </div>
                              </div>
                              <div className={rowsClasses}>
                                {notes.map(
                                  (
                                    { note, name, barcode }: TObject,
                                    noteIndex: number,
                                  ) => (
                                    <div className={css.row} key={noteIndex}>
                                      <div className="md:min-w-[5%]">{`${
                                        foodIndex + 1
                                      }.${noteIndex + 1}`}</div>
                                      <div className="flex-1">{name}</div>
                                      <div title={note} className="flex-1">
                                        <Tooltip
                                          tooltipContent="Ấn để copy"
                                          placement="top">
                                          <div
                                            className="w-fit text-sm flex items-center gap-2 transition-transform cursor-pointer"
                                            onClick={() =>
                                              handleCopyBarcode(barcode)
                                            }>
                                            <svg
                                              width="16px"
                                              height="16px"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                              xmlns="http://www.w3.org/2000/svg">
                                              <path
                                                d="M11.1 22.75H6.9C2.99 22.75 1.25 21.01 1.25 17.1V12.9C1.25 8.99 2.99 7.25 6.9 7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V17.1C16.75 21.01 15.01 22.75 11.1 22.75ZM6.9 8.75C3.8 8.75 2.75 9.8 2.75 12.9V17.1C2.75 20.2 3.8 21.25 6.9 21.25H11.1C14.2 21.25 15.25 20.2 15.25 17.1V12.9C15.25 9.8 14.2 8.75 11.1 8.75H6.9V8.75Z"
                                                fill="currentColor"
                                              />
                                              <path
                                                d="M17.1 16.75H16C15.59 16.75 15.25 16.41 15.25 16V12.9C15.25 9.8 14.2 8.75 11.1 8.75H8C7.59 8.75 7.25 8.41 7.25 8V6.9C7.25 2.99 8.99 1.25 12.9 1.25H17.1C21.01 1.25 22.75 2.99 22.75 6.9V11.1C22.75 15.01 21.01 16.75 17.1 16.75ZM16.75 15.25H17.1C20.2 15.25 21.25 14.2 21.25 11.1V6.9C21.25 3.8 20.2 2.75 17.1 2.75H12.9C9.8 2.75 8.75 3.8 8.75 6.9V7.25H11.1C15.01 7.25 16.75 8.99 16.75 12.9V15.25Z"
                                                fill="currentColor"
                                              />
                                            </svg>
                                            <span>{barcode}</span>
                                          </div>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </React.Fragment>
                          );
                        },
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              foodDataList.map(renderTableRowGroup)
            )}
          </div>
        </div>
      </div>
      <RenderWhen.False>
        <Skeleton className={css.loading} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SubOrderQrCode;
