import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { MessageCircle } from 'lucide-react';

import RatingReview from '@components/RatingReview/RatingReview';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  fetchReviews,
  setFilters,
  submitReply,
} from '@redux/slices/Reviews.admin.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import type { EUserRole } from '@src/utils/enums';

const OrderReviewPage = () => {
  const dispatch = useAppDispatch();
  const {
    reviews,
    pagination,
    fetchReviewsInProgress,
    submitReplyInProgress,
    fetchReviewsError,
    filters,
  } = useAppSelector((state) => state.adminReviews);
  const FIRST_PAGE = 1;
  const [page, setPage] = useState(FIRST_PAGE);
  const currentUser = useAppSelector(currentUserSelector);

  const currentUserGetter = CurrentUser(currentUser);
  const { displayName } = currentUserGetter.getProfile();

  const totalReviews = pagination.totalItems;
  const filtersRef = useRef(filters);

  // Keep filtersRef in sync with filters
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch reviews on component mount
  useEffect(() => {
    dispatch(fetchReviews({}));
  }, [dispatch]);

  const handleSearch = useCallback(
    (orderCode: string) => {
      const trimmedOrderCode = orderCode.trim();
      const newOrderCode = trimmedOrderCode || undefined;
      const newFilters = { ...filtersRef.current, orderCode: newOrderCode };
      dispatch(setFilters({ orderCode: newOrderCode }));
      dispatch(fetchReviews({ ...newFilters, page: 1 }));
    },
    [dispatch],
  );

  const handleFilterRating = useCallback(
    (ratings: number[]) => {
      const newFilters = { ...filtersRef.current, ratings };
      dispatch(setFilters({ ratings }));
      dispatch(fetchReviews({ ...newFilters, page: 1 }));
    },
    [dispatch],
  );

  const handleReply = useCallback(
    async ({
      reviewId,
      replyRole,
      replyContent,
    }: {
      reviewId: string;
      replyRole: EUserRole;
      replyContent: string;
    }) => {
      try {
        await dispatch(
          submitReply({
            reviewId,
            replyRole,
            replyContent,
            authorId: currentUser?.id?.uuid || '',
            authorName: displayName || '',
          }),
        );
      } catch (error) {
        console.error('Error submitting reply:', error);
        toast.error((error as Error).message);
      }
    },
    [dispatch, currentUser?.id?.uuid, displayName],
  );

  const handlePageChange = useCallback(
    (newPage: number, pageSize: number) => {
      setPage(newPage);
      dispatch(
        fetchReviews({
          ...filtersRef.current,
          page: newPage,
          limit: pageSize,
        }),
      );
    },
    [dispatch],
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý đánh giá đơn hàng
        </h1>
        <p className="text-gray-600">
          Xem và trả lời các đánh giá từ khách hàng về dịch vụ đặt món
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      <RatingReview
        reviews={reviews}
        fetchReviewsInProgress={fetchReviewsInProgress}
        fetchReviewsError={fetchReviewsError}
        submitReplyInProgress={submitReplyInProgress}
        pagination={pagination}
        page={page}
        handleFilterRating={handleFilterRating}
        handleReply={handleReply}
        handleSearch={handleSearch}
        handlePageChange={handlePageChange}
        isShowFilters={true}
        selectedRatings={filters.ratings}
      />
    </div>
  );
};

export default OrderReviewPage;
