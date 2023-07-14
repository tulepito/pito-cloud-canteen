import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { isJoinedPlan } from '@helpers/orderHelper';
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

  const {
    orderDetail,
    participants = [],
    participantData: participantDataFromProps = [],
    anonymous = [],
    anonymousParticipantData: anonymousParticipantDataFromProps = [],
  } = data || {};

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

  return (
    <Modal
      title={
        <span className={css.modalTitle}>
          {intl.formatMessage({
            id: 'ReviewOrdersResultModal.title',
          })}
        </span>
      }
      isOpen={isOpen}
      handleClose={onClose}
      className={css.modalRoot}
      contentClassName={css.modalContentContainer}>
      <div className={css.contentContainer}>
        {preparedData.map((dateItem) => {
          const { date, orderData } = dateItem;

          return (
            <div className={css.dateContainer} key={date}>
              <div className={css.dateTitle}>
                {intl.formatMessage(
                  { id: 'ReviewOrdersResultModal.dateTitle' },
                  {
                    date: DateTime.fromMillis(Number(date)).toFormat(
                      'dd/MM/yyyy',
                    ),
                  },
                )}
              </div>
              <div className={css.contentContainer}>
                <div className={css.row}>
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
                {orderData.map((row: TObject) => {
                  const {
                    memberData,
                    foodData: { foodName, foodPrice = 0, requirement },
                  } = row;
                  const { name: memberName, id: memberId } = memberData || {};

                  return (
                    <div className={css.row} key={memberId}>
                      <div>{memberName}</div>
                      <div>{foodName}</div>
                      <div>{`${parseThousandNumber(foodPrice)}đ`}</div>
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <Button
        className={css.goBackButton}
        onClick={onDownloadReviewOrderResults}>
        {intl.formatMessage({ id: 'ReviewOrdersResultModal.downloadFile' })}
      </Button>
    </Modal>
  );
};

export default ReviewOrdersResultModal;
