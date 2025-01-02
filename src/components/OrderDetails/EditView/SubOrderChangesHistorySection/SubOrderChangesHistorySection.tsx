/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unsafe-optional-chaining */
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import useBoolean from '@hooks/useBoolean';
import { formatTimestamp } from '@src/utils/dates';
import { EEditSubOrderHistoryType } from '@src/utils/enums';
import type { TSubOrderChangeHistoryItem } from '@src/utils/types';

import css from './SubOrderChangesHistorySection.module.scss';

type TSubOrderChangesHistorySectionProps = {
  className?: string;
  subOrderChangesHistory: TSubOrderChangeHistoryItem[];
  querySubOrderChangesHistoryInProgress: boolean;
  onQueryMoreSubOrderChangesHistory: () => void;
  subOrderChangesHistoryTotalItems: number;
  loadMoreSubOrderChangesHistory: boolean;
  draftSubOrderChangesHistory: TSubOrderChangeHistoryItem[];
};

const LIST_BOTTOM_ID = 'bottom-item';

const SubOrderChangesHistoryItem = (props: TSubOrderChangeHistoryItem) => {
  const {
    type,
    newValue = {},
    oldValue = {},
    member,
    createdAt,
    authorRole,
  } = props;
  const intl = useIntl();
  const createdDate = formatTimestamp(
    createdAt?.seconds * 1000,
    'EEE, dd/MM/yyyy, HH:mm',
  );

  const itemContent = () => {
    switch (type) {
      case EEditSubOrderHistoryType.MEMBER_FOOD_ADDED: {
        const { foodName } = newValue;

        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.memberFoodAdded',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.memberFoodAddedContent',
            },
            {
              email: <span className={css.boldText}>"{member?.email}"</span>,
              foodName: <span className={css.boldText}>"{foodName}"</span>,
            },
          ),
        };
      }
      case EEditSubOrderHistoryType.MEMBER_FOOD_CHANGED: {
        const { foodName: oldFoodName } = oldValue;
        const { foodName: newFoodName } = newValue;

        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.memberFoodChanged',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.memberFoodChangedContent',
            },
            {
              newFoodName: (
                <span className={css.boldText}>"{newFoodName}"</span>
              ),
              oldFoodName: (
                <span className={css.boldText}>"{oldFoodName}"</span>
              ),
              email: <span className={css.boldText}>"{member?.email}"</span>,
            },
          ),
        };
      }
      case EEditSubOrderHistoryType.MEMBER_FOOD_REMOVED:
        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.memberFoodRemoved',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.memberFoodRemovedContent',
            },
            {
              email: <span className={css.boldText}>"{member?.email}"</span>,
              from: <span className={css.boldText}>"Đã chọn"</span>,
            },
          ),
        };
      case EEditSubOrderHistoryType.FOOD_ADDED: {
        const { foodName } = newValue;

        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.foodAdded',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.foodAddedContent',
            },
            {
              foodName: <span className={css.boldText}>"{foodName}"</span>,
              quantity: <span className={css.boldText}>1</span>,
            },
          ),
        };
      }
      case EEditSubOrderHistoryType.FOOD_REMOVED: {
        const { foodName, quantity } = oldValue;

        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.foodRemoved',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.foodRemovedContent',
            },
            {
              foodName: <span className={css.boldText}>"{foodName}"</span>,
              quantity: <span className={css.boldText}>{quantity}</span>,
            },
          ),
        };
      }
      case EEditSubOrderHistoryType.FOOD_DECREASED: {
        const { quantity: oldQuantity, foodName } = oldValue;
        const { quantity } = newValue;

        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.foodDecreased',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.foodDecreasedContent',
            },
            {
              foodName: <span className={css.boldText}>"{foodName}"</span>,
              quantity: (
                <span className={css.boldText}>{oldQuantity - quantity}</span>
              ),
            },
          ),
        };
      }
      case EEditSubOrderHistoryType.FOOD_INCREASED: {
        const { quantity: oldQuantity, foodName } = oldValue;
        const { quantity } = newValue;

        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.foodIncreased',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.foodIncreasedContent',
            },
            {
              foodName: <span className={css.boldText}>"{foodName}"</span>,
              quantity: (
                <span className={css.boldText}>{quantity - oldQuantity}</span>
              ),
            },
          ),
        };
      }
      default:
        return {};
    }
  };

  return (
    <div className={css.item}>
      <div className={css.itemTitle}>
        {authorRole === 'admin'
          ? '[Admin] '
          : authorRole === 'booker'
          ? '[Booker] '
          : ''}
        {itemContent().title}
      </div>
      <div className={css.itemContent}>{itemContent().content}</div>
      <div className={css.itemContent}>{createdDate}</div>
    </div>
  );
};

const SubOrderChangesHistorySection: React.FC<
  TSubOrderChangesHistorySectionProps
> = (props) => {
  const {
    className,
    subOrderChangesHistory = [],
    draftSubOrderChangesHistory = [],
    querySubOrderChangesHistoryInProgress,
    onQueryMoreSubOrderChangesHistory,
    subOrderChangesHistoryTotalItems,
    loadMoreSubOrderChangesHistory,
  } = props;
  const intl = useIntl();
  const classes = classNames(css.root, className);
  const collapsible = useBoolean();
  const sectionTitle = intl.formatMessage({
    id: 'SubOrderChangesHistorySection.title',
  });

  const handleQueryMore = async () => {
    await onQueryMoreSubOrderChangesHistory();
    const objDiv = document.getElementById(LIST_BOTTOM_ID);
    objDiv?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  };

  const handleCollapse = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    collapsible.value ? collapsible.setFalse() : collapsible.setTrue();
  };
  const reachTotalItems =
    subOrderChangesHistory.length >= subOrderChangesHistoryTotalItems;

  const mergedList = [
    ...draftSubOrderChangesHistory,
    ...subOrderChangesHistory,
  ];

  const listToRender = reachTotalItems
    ? !collapsible.value
      ? mergedList
      : mergedList.slice(0, 3)
    : mergedList;

  return (
    <div className={classes}>
      {querySubOrderChangesHistoryInProgress ? (
        <Skeleton className={css.loading} />
      ) : (
        <>
          <div>{sectionTitle}</div>
          <div className={css.listItem}>
            {listToRender.length > 0 ? (
              listToRender.map((item) => (
                <SubOrderChangesHistoryItem key={item.id} {...item} />
              ))
            ) : (
              <div className={css.noResults}>
                Chưa có hoạt động chỉnh sửa nào
              </div>
            )}
            <div id={LIST_BOTTOM_ID}></div>
          </div>
          {listToRender.length > 0 &&
            (!reachTotalItems ? (
              <InlineTextButton
                className={css.moreButton}
                onClick={handleQueryMore}
                inProgress={loadMoreSubOrderChangesHistory}
                type="button">
                Xem thêm
              </InlineTextButton>
            ) : mergedList.length > 3 ? (
              collapsible.value ? (
                <InlineTextButton
                  className={css.moreButton}
                  onClick={handleCollapse}
                  type="button">
                  Xem thêm
                </InlineTextButton>
              ) : (
                <InlineTextButton
                  className={css.moreButton}
                  onClick={handleCollapse}
                  type="button">
                  Ẩn bớt
                </InlineTextButton>
              )
            ) : null)}
        </>
      )}
    </div>
  );
};

export default SubOrderChangesHistorySection;
