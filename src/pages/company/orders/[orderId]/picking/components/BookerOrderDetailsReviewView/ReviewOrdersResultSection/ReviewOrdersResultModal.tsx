import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import { isJoinedPlan } from '@helpers/orderHelper';
import type { TObject, TUser } from '@utils/types';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

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
          const { foodId, status } = memberOrderData;
          const newItem = {
            memberData: participantData[memberId],
            foodData: {
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
  goBackToEditMode: () => void;
};

const ReviewOrdersResultModal: React.FC<TReviewOrdersResultModalProps> = (
  props,
) => {
  const { isOpen, onClose, goBackToEditMode, data } = props;
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
          const { displayName } = participant?.attributes?.profile || {};

          return {
            id: pid,
            email,
            name: displayName,
          };
        })
        .concat(
          anonymous.map((pid: string) => {
            const participant = anonymousParticipantDataFromProps.find(
              (p: TUser) => pid === p.id.uuid,
            );
            const { email } = participant?.attributes || {};
            const { displayName } = participant?.attributes?.profile || {};

            return {
              id: pid,
              email,
              name: displayName,
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
      title={intl.formatMessage({
        id: 'ReviewOrdersResultModal.title',
      })}
      isOpen={isOpen}
      handleClose={onClose}
      className={css.modalRoot}>
      <div className={css.modalContentContainer}>
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
                </div>
                {orderData.map((row: TObject) => {
                  const {
                    memberData,
                    foodData: { foodName, foodPrice },
                  } = row;
                  const { name: memberName, id: memberId } = memberData || {};

                  return (
                    <div className={css.row} key={memberId}>
                      <div>{memberName}</div>
                      <div>{foodName}</div>
                      <div>{`${foodPrice}đ`}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <Button className={css.goBackButton} onClick={goBackToEditMode}>
        {intl.formatMessage({ id: 'ReviewOrdersResultModal.goBackButtonText' })}
      </Button>
    </Modal>
  );
};

export default ReviewOrdersResultModal;
