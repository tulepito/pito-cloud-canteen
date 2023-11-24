import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch } from '@hooks/reduxHooks';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import type { RootState } from '@redux/store';

import { BookerSelectRestaurantThunks } from '../../BookerSelectRestaurant.slice';
import KeywordSearchPopoverContent from '../KeywordSearchPopoverContent/KeywordSearchPopoverContent';

import css from './KeywordSearchSection.module.scss';

function KeywordSearchSection() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isPopoverHovered, setIsisPopoverHovered] = useState(false);
  const router = useRouter();
  const { keywords } = router.query;
  const dispatch = useAppDispatch();

  const popularKeywords = useSelector(
    (state: RootState) => state.BookerSelectRestaurant.popularKeywords,
  );
  const recentKeywords = useSelector(
    (state: RootState) => state.BookerSelectRestaurant.recentKeywords,
  );

  useEffect(() => {
    dispatch(BookerSelectRestaurantThunks.fetchRecommendedKeywords());
  }, [dispatch]);

  const keywordsInitialValue = useMemo(() => {
    return {
      keywords: (keywords as string) || '',
    };
  }, [keywords]);

  const onSearchKeywordsSubmit = (values: any) => {
    const newQuery = { ...router.query };
    if (!values.keywords) {
      delete newQuery.keywords;
    } else {
      newQuery.keywords = values.keywords;
    }

    router.push({
      query: {
        ...newQuery,
      },
    });
  };

  const onKeyWordsChange = (keyword: string): void => {
    const newQuery = { ...router.query };
    if (!keyword) {
      delete newQuery.keywords;
    } else {
      newQuery.keywords = keyword;
    }

    router.push({
      query: {
        ...newQuery,
      },
    });
  };

  const onDeleteRecentKeyword = (keyword: string): void => {
    dispatch(BookerSelectRestaurantThunks.deleteRecentKeyword({ keyword }));
  };

  return (
    <Tooltip
      overlay={
        <KeywordSearchPopoverContent
          onMouseEnter={() => setIsisPopoverHovered(true)}
          onMouseLeave={() => setIsisPopoverHovered(false)}
          popularKeywords={popularKeywords}
          recentKeywords={recentKeywords}
          onKeyWordsChange={onKeyWordsChange}
          onDeleteRecentKeyword={onDeleteRecentKeyword}
        />
      }
      placement="bottomLeft"
      showArrow={false}
      visible={isInputFocused || isPopoverHovered}
      overlayClassName={css.tooltipOverlay}
      overlayInnerStyle={{ backgroundColor: '#fff', padding: 0 }}>
      <div>
        <KeywordSearchForm
          autoComplete="off"
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onSubmit={onSearchKeywordsSubmit}
          initialValues={keywordsInitialValue}
          placeholder="Tìm kiếm tên nhà hàng hoặc tên món ăn"
          inputClassName={css.keywordSearchForm}
          fullWidth
        />
      </div>
    </Tooltip>
  );
}

export default KeywordSearchSection;
