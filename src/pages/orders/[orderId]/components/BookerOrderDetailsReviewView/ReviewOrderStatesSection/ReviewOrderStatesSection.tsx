import HorizontalTimeLine from '@components/TimeLine/HorizontalTimeLine';
import StateItem from '@components/TimeLine/StateItem';
import { ETransactionState } from '@utils/transaction';

import css from './ReviewOrderStatesSection.module.scss';

export const prepareItemData = (transactionList = []) => {
  return transactionList;
};

type TReviewOrderStatesSectionProps = {};

const ReviewOrderStatesSection: React.FC<
  TReviewOrderStatesSectionProps
> = () => {
  // const { orderData, planData } = useAppSelector(
  //   (state) => state.OrderManagement,
  // );

  // const { startDate, endDate } = Listing(orderData as TListing).getMetadata();
  // const { orderDetails: planOrderDetails } = Listing(
  //   planData as TListing,
  // ).getMetadata();

  const items = [
    { state: ETransactionState.COMPLETED, date: '17/9/2022' },
    { state: ETransactionState.FAILED_DELIVERY, date: '18/9/2022' },
    { state: ETransactionState.DELIVERING, date: '19/9/2022' },
    { state: ETransactionState.CANCELED, date: '20/9/2022' },
    { state: ETransactionState.INITIAL, date: '20/9/2022' },
  ];

  return (
    <div className={css.root}>
      <HorizontalTimeLine
        items={items}
        itemComponent={StateItem}
        haveNavigators
      />
    </div>
  );
};

export default ReviewOrderStatesSection;
