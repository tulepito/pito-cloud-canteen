import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { MessageCircle, Search } from 'lucide-react';

import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import Pagination from '@components/Pagination/Pagination';
import RatingFilter from '@components/RatingReview/RatingFilter';
import ReviewCard from '@components/RatingReview/ReviewCard';
import Tooltip from '@components/Tooltip/Tooltip';
import useDebounce from '@hooks/useDebounce';
import type { RatingListing } from '@src/types';
import type { EUserRole } from '@src/utils/enums';
import type { TPagination } from '@src/utils/types';

interface RatingReviewProps {
  reviews: RatingListing & { authorName: string }[];
  fetchReviewsInProgress: boolean;
  fetchReviewsError: string | null;
  submitReplyInProgress?: boolean;
  handleReply?: ({
    reviewId,
    replyRole,
    replyContent,
  }: {
    reviewId: string;
    replyRole: EUserRole;
    replyContent: string;
  }) => void;
  pagination: TPagination;
  page: number;
  handleSearch?: (orderCode: string) => void;
  handlePageChange?: (page: number) => void;
  isShowFilters?: boolean;
  isDisabledReply?: boolean;
  handleFilterRating?: (ratings: number[]) => void;
  selectedRatings?: number[];
}

const RatingReview = ({
  reviews,
  fetchReviewsInProgress,
  fetchReviewsError,
  pagination,
  page,
  handleSearch,
  handleFilterRating,
  handlePageChange,
  handleReply,
  submitReplyInProgress = false,
  isShowFilters = false,
  isDisabledReply = false,
  selectedRatings = [],
}: RatingReviewProps) => {
  const intl = useIntl();
  const [orderCode, setOrderCode] = useState('');
  const debouncedOrderCode = useDebounce(orderCode, 400);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;

      return;
    }
    const trimmed = debouncedOrderCode.trim();
    handleSearch?.(trimmed || '');
  }, [debouncedOrderCode, handleSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderCode(e.target.value);
  };

  const ratingDetail = [
    {
      rating: 1,
    },
    {
      rating: 2,
    },
    {
      rating: 3,
    },
    {
      rating: 4,
    },
    {
      rating: 5,
    },
  ];

  return (
    <>
      {/* Filters */}
      {isShowFilters && (
        <div className="flex gap-4 justify-between items-center w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={orderCode}
              onChange={handleSearchChange}
              placeholder={intl.formatMessage({
                id: 'RatingReview.searchOrderCodePlaceholder',
              })}
              className="w-full pl-10 pr-4 py-2 flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <Tooltip
            tooltipContent={
              <RatingFilter
                ratingDetail={ratingDetail}
                selected={selectedRatings}
                onSubmit={handleFilterRating}
              />
            }
            overlayInnerStyle={{
              padding: 0,
              backgroundColor: 'white',
              marginRight: '20px',
            }}
            showArrow={false}
            trigger="click"
            placement="bottom">
            <Button type="button" variant="secondary">
              <IconFilter className="mx-1" />
              <FormattedMessage id="IntegrationFilterModal.filterMessage" />
            </Button>
          </Tooltip>
        </div>
      )}

      {/* Loading State */}
      {fetchReviewsInProgress && (
        <div className="text-center w-full py-12">
          <LoadingContainer className="max-w-24 max-h-24 mb-4" />
        </div>
      )}

      {/* Error State */}
      {fetchReviewsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            <FormattedMessage
              id="RatingReview.errorLoadingReviews"
              values={{ error: fetchReviewsError }}
            />
          </p>
        </div>
      )}

      {/* Reviews List */}
      {!fetchReviewsInProgress && (
        <div className="space-y-6 w-full mt-2">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                <FormattedMessage id="RatingReview.noReviewsTitle" />
              </h3>
              <p className="text-gray-600">
                <FormattedMessage id="RatingReview.noReviewsDescription" />
              </p>
            </div>
          ) : (
            reviews.map((review: RatingListing & { authorName: string }) => (
              <ReviewCard
                key={review.id?.uuid}
                review={review}
                onReply={handleReply}
                isSubmittingReply={submitReplyInProgress}
                isDisabledReply={isDisabledReply}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!fetchReviewsInProgress && pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            total={pagination.totalItems}
            pageSize={pagination.perPage}
            current={page}
            onChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default RatingReview;
