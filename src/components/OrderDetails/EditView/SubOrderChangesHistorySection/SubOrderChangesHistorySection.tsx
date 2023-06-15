/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unsafe-optional-chaining */
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderHistoryTypes } from '@src/utils/enums';
import type { TSubOrderChangeHistoryItem } from '@src/utils/types';

import css from './SubOrderChangesHistorySection.module.scss';

type TSubOrderChangesHistorySectionProps = {
  className?: string;
  subOrderChangesHistory: TSubOrderChangeHistoryItem[];
  querySubOrderChangesHistoryInProgress: boolean;
  onQueryMoreSubOrderChangesHistory: () => void;
  subOrderChangesHistoryTotalItems: number;
  loadMoreSubOrderChangesHistory: boolean;
};

const SubOrderChangesHistoryItem = (props: TSubOrderChangeHistoryItem) => {
  const { type, newValue = {}, oldValue = {}, member, createdAt } = props;
  const intl = useIntl();
  const createdDate = formatTimestamp(
    createdAt?.seconds * 1000,
    'EEE, dd/MM/yyyy, HH:mm',
  );

  const itemContent = () => {
    switch (type) {
      case EOrderHistoryTypes.MEMBER_FOOD_ADDED: {
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
              email: (
                <span className={css.boldText}>
                  "{member?.attributes?.email}"
                </span>
              ),
              foodName: <span className={css.boldText}>"{foodName}"</span>,
            },
          ),
        };
      }
      case EOrderHistoryTypes.MEMBER_FOOD_CHANGED: {
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
              email: (
                <span className={css.boldText}>
                  "{member?.attributes?.email}"
                </span>
              ),
            },
          ),
        };
      }
      case EOrderHistoryTypes.MEMBER_FOOD_REMOVED:
        return {
          title: intl.formatMessage({
            id: 'SubOrderChangesHistoryItem.memberFoodRemoved',
          }),
          content: intl.formatMessage(
            {
              id: 'SubOrderChangesHistoryItem.memberFoodRemovedContent',
            },
            {
              email: (
                <span className={css.boldText}>
                  "{member?.attributes?.email}"
                </span>
              ),
              from: <span className={css.boldText}>"Đã chọn"</span>,
            },
          ),
        };
      default:
        return {};
    }
  };

  return (
    <div className={css.item}>
      <div className={css.itemTitle}>{itemContent().title}</div>
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
    querySubOrderChangesHistoryInProgress,
    onQueryMoreSubOrderChangesHistory,
    subOrderChangesHistoryTotalItems,
    loadMoreSubOrderChangesHistory,
  } = props;
  const intl = useIntl();
  const classes = classNames(css.root, className);
  const sectionTitle = intl.formatMessage({
    id: 'SubOrderChangesHistorySection.title',
  });

  return (
    <div className={classes}>
      {querySubOrderChangesHistoryInProgress ? (
        <Skeleton className={css.loading} />
      ) : (
        <>
          <div>{sectionTitle}</div>
          <div className={css.listItem}>
            {subOrderChangesHistory.map((item) => (
              <SubOrderChangesHistoryItem key={item.planId} {...item} />
            ))}
          </div>
          {subOrderChangesHistory.length < subOrderChangesHistoryTotalItems && (
            <InlineTextButton
              className={css.moreButton}
              onClick={onQueryMoreSubOrderChangesHistory}
              inProgress={loadMoreSubOrderChangesHistory}
              type="button">
              Xem thêm
            </InlineTextButton>
          )}
        </>
      )}
    </div>
  );
};

export default SubOrderChangesHistorySection;
