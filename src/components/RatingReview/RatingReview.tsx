import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { uniq } from 'lodash';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import Pagination from '@components/Pagination/Pagination';
import ReviewCard from '@components/RatingReview/ReviewCard';
import ReviewFilters from '@components/RatingReview/ReviewFilters';
import Tooltip from '@components/Tooltip/Tooltip';
import PartnerReviewsFilterForm from '@pages/partner/reviews/components/PartnerReviewsFilterForm/PartnerReviewsFilterForm';
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
  handleSearch?: (search: string) => void;
  handleUserSearch?: (userSearch: string) => void;
  handlePageChange?: (page: number) => void;
  isShowFilters?: boolean;
  isDisabledReply?: boolean;
  ratingDetail?: any;
}

const RatingReview = ({
  reviews,
  fetchReviewsInProgress,
  fetchReviewsError,
  pagination,
  page,
  ratingDetail,
  handleSearch,
  handleUserSearch,
  handlePageChange,
  handleReply,
  submitReplyInProgress = false,
  isShowFilters = false,
  isDisabledReply = false,
}: RatingReviewProps) => {
  const {
    query: { rating: queryRating },
  } = useRouter();

  const convertRatingToNumber = useCallback((rating: string) => {
    const result: number[] = [];
    rating.split(',').forEach((rate) => {
      result.push(Number(rate));
    });

    return result;
  }, []);
  const ratings = useMemo(() => {
    const result = [];

    if (queryRating) {
      if (Array.isArray(queryRating)) {
        queryRating.forEach((rating) => {
          result.push(...convertRatingToNumber(rating));
        });
      } else {
        result.push(...convertRatingToNumber(queryRating));
      }
    }

    return uniq(result);
  }, [queryRating]);

  return (
    <>
      {/* Filters */}
      {isShowFilters && (
        <>
          <ReviewFilters
            onSearch={handleSearch}
            onUserSearch={handleUserSearch}
          />
          <Tooltip
            tooltipContent={
              <PartnerReviewsFilterForm
                onSubmit={() => { }}
                onClearFilter={() => { }}
                pristine={false}
                ratingDetail={ratingDetail}
                initialValues={{ ratings: uniq(ratings) }}
              />
            }
            trigger="click"
            placement="bottom">
            <Button type="button" variant="secondary">
              <IconFilter />
              <FormattedMessage id="IntegrationFilterModal.filterMessage" />
            </Button>
          </Tooltip>
        </>
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
            Có lỗi xảy ra khi tải đánh giá: {fetchReviewsError}
          </p>
        </div>
      )}

      {/* Reviews List */}
      {!fetchReviewsInProgress && (
        <div className="space-y-6 w-full">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có đánh giá nào
              </h3>
              <p className="text-gray-600">
                Không tìm thấy đánh giá nào phù hợp với bộ lọc hiện tại.
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
