/* eslint-disable no-await-in-loop */
/* eslint-disable new-cap */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import logger from '@helpers/logger';
import { isJoinedPlan } from '@helpers/order/orderPickingHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import type { UserListing } from '@src/types';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TObject, TUser } from '@utils/types';

import UserLabelHiddenSection from './UserLabelHiddenSection';
import UserLabelPreviewModal from './UserLabelPreviewModal';

import css from './ReviewOrdersResultModal.module.scss';

const prepareData = ({
  orderDetail = {},
  participantData = {},
}: {
  orderDetail: TObject;
  participantData: TObject;
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
};

const ReviewOrdersResultModal: React.FC<TReviewOrdersResultModalProps> = (
  props,
) => {
  const { isOpen, onClose, onDownloadReviewOrderResults, data } = props;
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const [expandingStatusMap, setExpandingStatusMap] = useState<any>({});
  const [isViewUserLabelModalOpen, setIsViewUserLabelModalOpen] =
    useState(false);
  const [userLabelPreviewSrcs, setUserLabelPreviewSrcs] = useState<string[]>(
    [],
  );
  const [targetedDate, setTargetDate] = useState<string | 'all'>('all');
  const allowTriggerGenerateUserLabelFile = useRef(false);

  const [isGeneratingUserLabelFile, setIsGeneratingUserLabelFile] =
    useState(false);
  const currentUser: UserListing | null = useAppSelector(
    (state) => state.user.currentUser,
  );

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

  const preparedData = prepareData({
    orderDetail,
    participantData: participantDataMap,
  });

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

  const generateUserLabels = async (exportType: 'state' | 'pdf-file') => {
    if (!allowTriggerGenerateUserLabelFile.current) return;

    logger.info('Generating user labels...', 'START');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const printableAreas = document.querySelectorAll('[id^=printable-area-]');
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const _userLabelPreviewSrcs = [];

    setIsGeneratingUserLabelFile(true);
    for (let i = 0; i < printableAreas.length; i++) {
      const printableArea = printableAreas[i];
      const canvas = await html2canvas(printableArea as any, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      /**
       * TODO: improve performance by caching the image data
       */
      const imgData = canvas.toDataURL('image/png');

      if (exportType === 'state') {
        _userLabelPreviewSrcs.push(imgData);
      }

      if (exportType === 'pdf-file') {
        const marginTopBottom = 10;
        const marginLeftRight = 4;
        pdf.addImage(
          imgData,
          'PNG',
          marginLeftRight,
          marginTopBottom,
          pageWidth - marginLeftRight * 2,
          pageHeight - marginTopBottom * 2,
          undefined,
          'FAST',
        );

        if (i < printableAreas.length - 1) {
          pdf.addPage();
        }
      }
    }

    if (exportType === 'state') {
      setUserLabelPreviewSrcs(_userLabelPreviewSrcs);
    }

    if (exportType === 'pdf-file') {
      pdf.save('user-labels.pdf');
    }

    setIsGeneratingUserLabelFile(false);
  };

  /**
   * When targetedDate is changed, trigger the generation of user labels
   */
  useEffect(() => {
    generateUserLabels('state');
  }, [targetedDate]);

  const withSetCurrentDateTo =
    (date: string | 'all', callback: () => void) => () => {
      allowTriggerGenerateUserLabelFile.current = true;
      setTargetDate(date);
      setTimeout(callback);
    };

  const content = (
    <>
      <div className={css.tableContainer}>
        <div className="relative">
          <div className={css.headRow}>
            <div className={css.head}>
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.name',
              })}
            </div>
            <div className={css.head}>
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.foodName',
              })}
            </div>
            <div className={css.head}>
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.price',
              })}
            </div>
            <div className={css.head}>
              {intl.formatMessage({
                id: 'ReviewOrdersResultModal.tableHead.requirement',
              })}
            </div>
          </div>

          {isAdmin && (
            <div className="absolute top-1.5 right-2">
              <Button
                size="small"
                loadingMode="extend"
                inProgress={isGeneratingUserLabelFile && targetedDate === 'all'}
                className="h-[28px]"
                onClick={withSetCurrentDateTo('all', () => {
                  generateUserLabels('pdf-file');
                })}>
                Tải toàn bộ label
              </Button>
            </div>
          )}
        </div>

        {preparedData.map(({ date, orderData }) => {
          const isExpanding = expandingStatusMap[date];
          const isEmptyOrderData = isEmpty(orderData);

          return (
            <div className={css.dateContainer} key={date}>
              <div className={css.dateTitle}>
                <div>
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
                  <div className="flex items-center">
                    {isAdmin && (
                      <RenderWhen condition={!isMobileLayout}>
                        <Button
                          variant="inline"
                          size="small"
                          onClick={withSetCurrentDateTo(date, () => {
                            setIsViewUserLabelModalOpen(true);
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
                          onClick={withSetCurrentDateTo(date, () => {
                            generateUserLabels('pdf-file');
                          })}>
                          Tải label
                        </Button>
                      </RenderWhen>
                    )}
                    <IconArrow
                      direction={isExpanding ? 'up' : 'down'}
                      onClick={toggleCollapseStatus(date)}
                    />
                  </div>
                </RenderWhen>
              </div>
              <RenderWhen condition={isExpanding}>
                <div className={css.contentContainer}>
                  {orderData.map((row: TObject) => {
                    const {
                      memberData,
                      foodData: { foodName, foodPrice = 0, requirement },
                    } = row;
                    const { name: memberName, id: memberId } = memberData || {};

                    return (
                      <div key={memberId} className={css.rowContainer}>
                        <div className={css.row}>
                          <div className={css.memberName}>{memberName}</div>
                          <div>{foodName}</div>
                          <div
                            className={css.foodPrice}>{`${parseThousandNumber(
                            foodPrice,
                          )}đ`}</div>
                          {requirement ? (
                            <Tooltip
                              overlayClassName={css.requirementTooltip}
                              tooltipContent={requirement}
                              placement="bottomLeft">
                              <div>{requirement}</div>
                            </Tooltip>
                          ) : (
                            <div>-</div>
                          )}
                        </div>
                        <RenderWhen condition={!!requirement}>
                          <div className={css.mobileRequirement}>
                            <div />
                            <div> {requirement}</div>
                          </div>
                        </RenderWhen>
                      </div>
                    );
                  })}
                </div>
              </RenderWhen>
            </div>
          );
        })}
      </div>
      <Button className={css.button} onClick={onDownloadReviewOrderResults}>
        {isMobileLayout
          ? intl.formatMessage({
              id: 'ReviewOrdersResultModal.mobileDownloadFileText',
            })
          : intl.formatMessage({
              id: 'ReviewOrdersResultModal.downloadFileText',
            })}
      </Button>
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
            className={css.modalRoot}
            contentClassName={css.modalContentContainer}>
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
        <UserLabelHiddenSection
          preparedData={preparedData}
          targetedDate={targetedDate}
        />
      )}
    </>
  );
};

export default ReviewOrdersResultModal;
