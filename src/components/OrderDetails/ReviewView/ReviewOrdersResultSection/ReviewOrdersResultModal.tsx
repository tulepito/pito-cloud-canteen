import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { isJoinedPlan } from '@helpers/orderHelper';
import { useViewport } from '@hooks/useViewport';
import type { TObject, TUser } from '@utils/types';

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
          );
          const { email } = participant?.attributes || {};
          const { lastName = '', firstName = '' } =
            participant?.attributes?.profile || {};

          return {
            id: pid,
            email,
            name: `${lastName} ${firstName}`,
          };
        })
        .concat(
          anonymous.map((pid: string) => {
            const participant = anonymousParticipantDataFromProps.find(
              (p: TUser) => pid === p.id.uuid,
            );
            const { email } = participant?.attributes || {};
            const { lastName = '', firstName = '' } =
              participant?.attributes?.profile || {};

            return {
              id: pid,
              email,
              name: `${lastName} ${firstName}`,
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
      const updateObject = preparedData.reduce((result: any, { date }: any) => {
        if (typeof result[date] === 'undefined') {
          result[date] = true;
        }

        return result;
      }, expandingStatusMap);
      setExpandingStatusMap(updateObject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(preparedData)]);

  const content = (
    <>
      <div className={css.tableContainer}>
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

        {preparedData.map(({ date, orderData }) => {
          const isExpanding = expandingStatusMap[date];

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
                <IconArrow
                  direction={isExpanding ? 'up' : 'down'}
                  onClick={toggleCollapseStatus(date)}
                />
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
  );
};

export default ReviewOrdersResultModal;
