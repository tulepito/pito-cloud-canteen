import React, { useEffect, useState } from 'react';
import { MessageCircle, Star, TrendingUp, Users } from 'lucide-react';

import RatingReview from '@components/RatingReview/RatingReview';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  fetchReviews,
  setFilters,
  submitReply,
} from '@redux/slices/Reviews.admin.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import type { RatingListing } from '@src/types';
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

  // Statistics - Note: These should be calculated from all reviews, not just current page
  const totalReviews = pagination.totalItems;
  const averageRating = 0;
  const reviewsWithReplies = reviews.filter(
    (review: RatingListing & { authorName: string }) =>
      review.attributes?.metadata?.replies?.length &&
      review.attributes?.metadata?.replies?.length > 0,
  ).length;
  const pendingReplies = totalReviews - reviewsWithReplies;

  // Fetch reviews on component mount
  useEffect(() => {
    dispatch(fetchReviews({}));
  }, [dispatch]);

  const handleSearch = (query: string) => {
    dispatch(setFilters({ search: query }));
    dispatch(fetchReviews({ ...filters, search: query, page: 1 }));
  };

  const handleUserSearch = (userQuery: string) => {
    dispatch(setFilters({ userSearch: userQuery }));
    dispatch(fetchReviews({ ...filters, userSearch: userQuery, page: 1 }));
  };

  const handleReply = async ({
    reviewId,
    replyRole,
    replyContent,
  }: {
    reviewId: string;
    replyRole: EUserRole;
    replyContent: string;
  }) => {
    await dispatch(
      submitReply({
        reviewId,
        replyRole,
        replyContent,
        authorId: currentUser?.id?.uuid || '',
        authorName: displayName || '',
      }),
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    dispatch(fetchReviews({ ...filters, page: newPage }));
  };

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

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã phản hồi</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviewsWithReplies}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ phản hồi</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingReplies}
              </p>
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
        handleReply={handleReply}
        handleSearch={handleSearch}
        handleUserSearch={handleUserSearch}
        handlePageChange={handlePageChange}
        isShowFilters={true}
      />
    </div>
  );
};

export default OrderReviewPage;
