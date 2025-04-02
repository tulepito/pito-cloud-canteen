import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconDownload from '@components/Icons/IconDownload/IconDownload';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import logger from '@helpers/logger';
import { isJoinedPlan } from '@helpers/order/orderPickingHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { generateScannerBarCode } from '@pages/api/admin/scanner/[planId]/toggle-mode.api';
import { enGeneralPaths } from '@src/paths';
import type { PlanListing, UserListing } from '@src/types';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TObject, TUser } from '@utils/types';

import css from './ReviewOrdersResultModal.module.scss';

const UserLabelCellContent = dynamic(() => import('./UserLabelCellContent'), {
  ssr: false,
});

const UserLabelHiddenSection = dynamic(
  () => import('./UserLabelHiddenSection'),
  { ssr: false },
);

const UserLabelPreviewModal = dynamic(() => import('./UserLabelPreviewModal'), {
  ssr: false,
});

function UserLabelThermalPrintSection({
  userLabelRecords,
}: {
  userLabelRecords: UserLabelRecord[];
}) {
  return (
    <>
      {userLabelRecords.map((userLabelRecord, idx) => (
        <div key={idx} className="w-[58mm] h-[44mm]">
          <UserLabelCellContent
            partnerName={userLabelRecord.partnerName}
            companyName={userLabelRecord.companyName}
            mealDate={userLabelRecord.mealDate}
            participantName={userLabelRecord.participantName}
            foodName={userLabelRecord.foodName}
            qrCodeImageSrc={userLabelRecord.qrCodeImageSrc}
            note={userLabelRecord.requirement}
          />
        </div>
      ))}
    </>
  );
}

export interface UserLabelRecord {
  partnerName: string;
  companyName: string;
  mealDate: string;
  timestamp: string;
  participantName: string;
  foodName: string;
  requirement?: string;
  qrCodeImageSrc: string;
}

const prepareData = ({
  orderDetail = {},
  participantData = {},
  planId,
}: {
  orderDetail: TObject;
  participantData: TObject;
  planId: string;
}) => {
  return Object.entries<TObject>(orderDetail).reduce<TObject[]>(
    (result, currentOrderDetailEntry) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const { memberOrders = {}, restaurant = {} } = rawOrderDetailOfDate;
      const { foodList: foodListOfDate = {} } = restaurant;

      const orderData = Object.entries<TObject>(memberOrders).reduce<TObject[]>(
        (memberOrderResult, currentMemberOrderEntry) => {
          const [memberId, memberOrderData] = currentMemberOrderEntry;
          const { foodId, status, requirement } = memberOrderData;
          const newItem = {
            memberData: participantData[memberId],
            foodData: {
              requirement,
              foodId,
              ...foodListOfDate[foodId],
            },
            restaurant,
            barcode: generateScannerBarCode(planId, memberId, date),
          };

          return isJoinedPlan(foodId, status)
            ? memberOrderResult.concat([newItem])
            : memberOrderResult;
        },
        [],
      );

      return [
        ...result,
        {
          date,
          orderData,
        },
      ];
    },
    [],
  );
};

type TReviewOrdersResultModalProps = {
  isOpen: boolean;
  data: TObject;
  onClose: () => void;
  onDownloadReviewOrderResults: () => void;
  planListing?: PlanListing;
};

const ReviewOrdersResultModal: React.FC<TReviewOrdersResultModalProps> = (
  props,
) => {
  const { isOpen, onClose, onDownloadReviewOrderResults, data, planListing } =
    props;
  const showBarcode = planListing?.attributes?.metadata?.allowToScan;
  const planId = planListing?.id?.uuid;
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const [expandingStatusMap, setExpandingStatusMap] = useState<any>({});
  const [isViewUserLabelModalOpen, setIsViewUserLabelModalOpen] =
    useState(false);
  const [userLabelPreviewSrcs, setUserLabelPreviewSrcs] = useState<string[]>(
    [],
  );
  const [targetedDate, setTargetDate] = useState<string | 'all'>('all');
  const currentPrintMode = useRef<'pdf' | 'thermal'>('pdf');
  const allowTriggerGenerateUserLabelFile = useRef(false);

  const [isGeneratingUserLabelFile, setIsGeneratingUserLabelFile] =
    useState(false);
  const currentUser: UserListing | null = useAppSelector(
    (state) => state.user.currentUser,
  );

  const thermalPrintSectionRef = useRef<HTMLDivElement>(null);

  const [qrCodeImageSrcMap, setQrCodeImageSrcMap] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  const isAdmin = currentUser?.attributes?.profile?.metadata?.isAdmin;

  const {
    orderDetail,
    participants = [],
    participantData: participantDataFromProps = [],
    anonymous = [],
    anonymousParticipantData: anonymousParticipantDataFromProps = [],
  } = data || {};

  const modalTitle = (
    <span className={css.modalTitle}>
      {intl.formatMessage({
        id: 'ReviewOrdersResultModal.title',
      })}
    </span>
  );

  const participantDataList = useMemo(
    () =>
      participants
        .map((pid: string) => {
          const participant = participantDataFromProps.find(
            (p: TUser) => pid === p.id.uuid,
          ) as UserListing | undefined;

          return {
            id: pid,
            email: participant?.attributes?.email,
            name: buildFullName(
              participant?.attributes?.profile?.firstName,
              participant?.attributes?.profile?.lastName,
              {
                compareToGetLongerWith:
                  participant?.attributes?.profile?.displayName,
              },
            ),
          };
        })
        .concat(
          anonymous.map((pid: string) => {
            const participant = anonymousParticipantDataFromProps.find(
              (p: TUser) => pid === p.id.uuid,
            ) as UserListing | undefined;

            return {
              id: pid,
              email: participant?.attributes?.email,
              name: buildFullName(
                participant?.attributes?.profile?.firstName,
                participant?.attributes?.profile?.lastName,
                {
                  compareToGetLongerWith:
                    participant?.attributes?.profile?.displayName,
                },
              ),
            };
          }),
        ),
    [
      anonymous,
      anonymousParticipantDataFromProps,
      participantDataFromProps,
      participants,
    ],
  );

  const participantDataMap = useMemo(
    () =>
      participantDataList.reduce((res: TObject, curr: TObject) => {
        return { ...res, [curr.id]: curr };
      }, {}),
    [participantDataList],
  );

  const preparedData = useMemo(
    () =>
      prepareData({
        orderDetail,
        participantData: participantDataMap,
        planId: planListing?.id?.uuid || '',
      }),
    [orderDetail, participantDataMap, planListing?.id?.uuid],
  );

  const toggleCollapseStatus = (date: string) => () => {
    setExpandingStatusMap({
      ...expandingStatusMap,
      [date]: !expandingStatusMap[date],
    });
  };

  useEffect(() => {
    if (!isEmpty(preparedData)) {
      const updateObject = preparedData.reduce(
        (result: any, { date, orderData }: any) => {
          if (typeof result[date] === 'undefined') {
            if (!isEmpty(orderData)) result[date] = true;
          }

          return result;
        },
        expandingStatusMap,
      );
      setExpandingStatusMap(updateObject);
    }
  }, [JSON.stringify(preparedData)]);

  const generatePDFModeLabels = useCallback(
    async (exportType: 'preview' | 'pdf-file') => {
      if (!isAdmin) return;
      if (currentPrintMode.current !== 'pdf') return;
      if (!allowTriggerGenerateUserLabelFile.current) return;

      logger.info('Generating user labels...', 'START');

      // eslint-disable-next-line new-cap
      const pdf = new jsPDF('p', 'mm', 'a4');

      const printableAreas = document.querySelectorAll('[id^=printable-area-]');
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const _userLabelPreviewSrcs = [];

      setIsGeneratingUserLabelFile(true);
      for (let i = 0; i < printableAreas.length; i++) {
        const printableArea = printableAreas[i];
        // eslint-disable-next-line no-await-in-loop
        const canvas = await html2canvas(printableArea as any, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');

        if (exportType === 'preview') {
          _userLabelPreviewSrcs.push(imgData);
        }

        if (exportType === 'pdf-file') {
          const marginTopBottom = 4;
          const marginLeftRight = 4;
          pdf.addImage(
            imgData,
            'PNG',
            marginLeftRight,
            marginTopBottom,
            pageWidth - marginLeftRight * 2,
            pageHeight - marginTopBottom,
            undefined,
            'FAST',
          );

          if (i < printableAreas.length - 1) {
            pdf.addPage();
          }
        }
      }

      if (exportType === 'preview') {
        setUserLabelPreviewSrcs(_userLabelPreviewSrcs);
      }

      if (exportType === 'pdf-file') {
        pdf.save('user-labels.pdf');
      }

      setIsGeneratingUserLabelFile(false);
    },
    [isAdmin],
  );

  /**
   * Generate QR code image src
   */
  useEffect(() => {
    const datesNeededToGenerateQrCode = preparedData.reduce<Set<string>>(
      (result, { date }) => {
        if (date === targetedDate || targetedDate === 'all') {
          result.add(date);
        }

        return result;
      },
      new Set<string>(),
    );

    const generateQrCodeImageSrcsPromises = Array.from(
      datesNeededToGenerateQrCode,
    ).map(async (date) => {
      const src = await QRCode.toDataURL(
        `${process.env.NEXT_PUBLIC_CANONICAL_URL}/participant/order/${router.query.orderId}/?subOrderDate=${date}&openRatingModal=true`,
      );

      return { [date]: src };
    });

    Promise.all(generateQrCodeImageSrcsPromises).then((srcs) => {
      setQrCodeImageSrcMap(
        srcs.reduce((result, current) => ({ ...result, ...current }), {}),
      );
    });
  }, [preparedData, router.query.orderId, targetedDate]);

  /**
   * When targetedDate is changed, trigger the generation of user labels
   */
  useEffect(() => {
    if (isOpen && targetedDate) {
      generatePDFModeLabels('preview');
    }
  }, [targetedDate, isOpen, generatePDFModeLabels]);

  const withSetCurrentDateTo =
    (date: string | 'all', callback: () => void) => () => {
      allowTriggerGenerateUserLabelFile.current = true;
      setTargetDate(date);
      setTimeout(callback);
    };

  const printThermalSection = async () => {
    if (!allowTriggerGenerateUserLabelFile.current) return;

    const printContent = thermalPrintSectionRef.current?.innerHTML;
    if (!printContent) return;
    const convertToImage = await html2canvas(thermalPrintSectionRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
    });
    const imgData = convertToImage.toDataURL('image/png');

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow?.document.write(`
      <style>
        body {
          margin: 0;
        }

        @media print {
          body {
            margin: 0;
          }

          @page {
            size: 58mm 44mm;
            margin: 0;
          }
        }
      </style>
      <img style="width: 55.785mm;" src="${imgData}" />
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  const company: UserListing | null = useAppSelector(
    (state) => state.OrderManagement.companyData,
    shallowEqual,
  );

  const userLabelRecords = preparedData
    .reduce<UserLabelRecord[]>((result, { date, orderData }) => {
      if (date === targetedDate || targetedDate === 'all') {
        const userLabelData = orderData.map(
          ({
            memberData,
            foodData,
            restaurant,
          }: {
            memberData: {
              name: string;
            };
            foodData: {
              foodName: string;
              requirement: string;
            };
            restaurant: {
              restaurantName: string;
            };
          }) => {
            const { name: participantName } = memberData || {};
            const { foodName, requirement } = foodData || {};

            return {
              partnerName: restaurant?.restaurantName,
              requirement,
              companyName:
                company?.attributes?.profile?.publicData?.companyName || '',
              mealDate: DateTime.fromMillis(Number(date)).toFormat(
                'dd/MM/yyyy',
              ),
              participantName,
              foodName,
              timestamp: date,
              qrCodeImageSrc: qrCodeImageSrcMap[date],
            } satisfies UserLabelRecord;
          },
        );

        return result.concat(userLabelData);
      }

      return result;
    }, [] as UserLabelRecord[])
    .sort((a, b) => {
      if (a.foodName < b.foodName) {
        return -1;
      }

      if (a.foodName > b.foodName) {
        return 1;
      }

      return 0;
    });

  const content = (
    <>
      <div className={css.tableContainer}>
        <div className="relative">
          <div className="flex gap-2 justify-end mb-4">
            <Button
              size="small"
              variant="secondary"
              className="h-[36px] px-2 !border-blue-500 hover:!text-stone-600"
              onClick={onDownloadReviewOrderResults}>
              <IconDownload className="min-w-[24px] min-h-[24px]" />
              {isMobileLayout
                ? intl.formatMessage({
                    id: 'ReviewOrdersResultModal.mobileDownloadFileText',
                  })
                : intl.formatMessage({
                    id: 'ReviewOrdersResultModal.downloadFileText',
                  })}
            </Button>
            {isAdmin && !!participants?.length && (
              <Button
                size="small"
                loadingMode="extend"
                variant="secondary"
                inProgress={isGeneratingUserLabelFile && targetedDate === 'all'}
                className="h-[36px] px-2 !border-blue-500 hover:!text-stone-600 hover:stroke-stone-600"
                onClick={withSetCurrentDateTo('all', () => {
                  setTimeout(() => {
                    generatePDFModeLabels('pdf-file');
                  });
                })}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width="24px"
                  height="24px"
                  xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    {' '}
                    <path
                      d="M8.5 7L8.5 14M8.5 14L11 11M8.5 14L6 11"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"></path>{' '}
                    <path
                      d="M15.5 7L15.5 14M15.5 14L18 11M15.5 14L13 11"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"></path>{' '}
                    <path
                      d="M18 17H12H6"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"></path>{' '}
                    <path
                      d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"></path>{' '}
                  </g>
                </svg>
                &nbsp;
                <span>Tải toàn bộ label</span>
              </Button>
            )}
          </div>
          <div className="flex items-center bg-gray-100 p-2 rounded-t-md text-sm font-semibold uppercase">
            <div className="flex-1 basis-[80px]">
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.name',
              })}
            </div>
            {showBarcode && <div className="flex-1">Barcode</div>}
            <div className="flex-1">
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.foodName',
              })}
            </div>
            <div className="flex-1">
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.price',
              })}
            </div>
            <div className="flex-1">
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.requirement',
              })}
            </div>
          </div>
        </div>

        {preparedData.map(({ date, orderData }) => {
          const isExpanding = expandingStatusMap[date];
          const isEmptyOrderData = isEmpty(orderData);

          return (
            <div className={css.dateContainer} key={date}>
              <div className={css.dateTitle}>
                <div className="flex-1 flex items-center">
                  {intl.formatMessage(
                    { id: 'ReviewOrdersResultModal.dateTitle' },
                    {
                      date: DateTime.fromMillis(Number(date)).toFormat(
                        'dd/MM/yyyy',
                      ),
                    },
                  )}
                </div>
                <RenderWhen condition={!isEmptyOrderData}>
                  <div className="flex flex-wrap justify-end gap-2 items-center">
                    {isAdmin && showBarcode && (
                      <Link
                        href={enGeneralPaths.admin.scanner['[planId]'][
                          '[timestamp]'
                        ].index(String(planId), date)}
                        legacyBehavior>
                        <a target="_blank">
                          <Button variant="inline" size="small">
                            <div className="flex items-center gap-2 text-blue-500">
                              <span>Mở trang scan</span>
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
                    )}

                    {isAdmin && (
                      <RenderWhen condition={!isMobileLayout}>
                        <div className="flex gap-2 items-center bg-orange-50 py-1 px-2 rounded-lg border border-orange-200">
                          <p className="text-xs ">Máy in nhiệt</p>
                          <Button
                            variant="inline"
                            size="small"
                            className={classNames({
                              '!bg-gray-200':
                                isGeneratingUserLabelFile &&
                                targetedDate === date,
                            })}
                            inProgress={
                              isGeneratingUserLabelFile && targetedDate === date
                            }
                            loadingMode="extend"
                            onClick={withSetCurrentDateTo(date, () => {
                              setTimeout(() => {
                                printThermalSection();
                              });
                            })}>
                            In label
                          </Button>
                        </div>
                      </RenderWhen>
                    )}

                    {isAdmin && (
                      <div className="flex gap-2 items-center bg-blue-50 py-1 px-2 rounded-lg border border-blue-200">
                        <p className="text-xs ">File label</p>
                        <RenderWhen condition={!isMobileLayout}>
                          <Button
                            variant="inline"
                            size="small"
                            className={classNames({
                              '!bg-gray-200':
                                isGeneratingUserLabelFile &&
                                targetedDate === date,
                            })}
                            inProgress={
                              isGeneratingUserLabelFile && targetedDate === date
                            }
                            onClick={withSetCurrentDateTo(date, () => {
                              setTimeout(() => {
                                setIsViewUserLabelModalOpen(true);
                              });
                            })}>
                            Xem label
                          </Button>
                          <Button
                            variant="inline"
                            size="small"
                            inProgress={
                              isGeneratingUserLabelFile && targetedDate === date
                            }
                            loadingMode="extend"
                            className={classNames({
                              '!bg-gray-200':
                                isGeneratingUserLabelFile &&
                                targetedDate === date,
                            })}
                            onClick={withSetCurrentDateTo(date, () => {
                              setTimeout(() => {
                                generatePDFModeLabels('pdf-file');
                              });
                            })}>
                            Tải label
                          </Button>
                        </RenderWhen>
                      </div>
                    )}
                    <IconArrow
                      direction={isExpanding ? 'up' : 'down'}
                      onClick={toggleCollapseStatus(date)}
                    />
                  </div>
                </RenderWhen>
              </div>
              <RenderWhen condition={isExpanding}>
                <div className="w-full">
                  {orderData.map((row: TObject) => {
                    const {
                      memberData,
                      foodData: { foodName, foodPrice = 0, requirement },
                      barcode,
                    } = row;
                    const { name: memberName, id: memberId } = memberData || {};

                    return (
                      <div key={memberId} className="flex items-center w-full">
                        <div className="flex items-center flex-1 text-xs p-2">
                          <div className="flex-1 basis-[80px] font-semibold">
                            {memberName}
                          </div>
                          {showBarcode && (
                            <Tooltip
                              tooltipContent="Ấn để copy"
                              placement="top">
                              <div
                                className="flex-1 text-xs !flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(barcode);
                                  toast.success(`Đã copy barcode: ${barcode}`);
                                }}>
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
                          )}
                          <div className="text-xs flex-1 font-semibold">
                            {foodName}
                          </div>
                          <div className="text-xs flex-1">{`${parseThousandNumber(
                            foodPrice,
                          )}đ`}</div>
                          {requirement ? (
                            <Tooltip
                              overlayClassName={css.requirementTooltip}
                              tooltipContent={requirement}
                              placement="bottomLeft">
                              <div className="flex-1">{requirement}</div>
                            </Tooltip>
                          ) : (
                            <div className="flex-1">-</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RenderWhen>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <RenderWhen condition={isMobileLayout}>
        <SlideModal
          id="ReviewOrdersResultModal"
          modalTitle={modalTitle}
          onClose={onClose}
          isOpen={isOpen}
          containerClassName={css.mobileModalContainer}
          contentClassName={css.mobileModalContent}>
          {content}
        </SlideModal>

        <RenderWhen.False>
          <Modal
            title={modalTitle}
            isOpen={isOpen}
            handleClose={onClose}
            containerClassName="!p-4"
            headerClassName="p-0"
            className={css.modalRoot}>
            {content}
          </Modal>
        </RenderWhen.False>
      </RenderWhen>

      {isAdmin && isViewUserLabelModalOpen && !isMobileLayout && (
        <UserLabelPreviewModal
          previewSrcs={userLabelPreviewSrcs}
          isOpen={isViewUserLabelModalOpen}
          handleClose={() => setIsViewUserLabelModalOpen(false)}
          isLoading={isGeneratingUserLabelFile}
        />
      )}

      {isAdmin && (
        <UserLabelHiddenSection userLabelRecords={userLabelRecords} />
      )}

      {isAdmin && (
        <div className="h-0 overflow-hidden absolute">
          <div
            className="flex flex-wrap gap-2 flex-col"
            ref={thermalPrintSectionRef}>
            <UserLabelThermalPrintSection userLabelRecords={userLabelRecords} />
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewOrdersResultModal;
