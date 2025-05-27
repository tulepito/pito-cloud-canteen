import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
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
  const [isPopoverHovered, setIsPopoverHovered] = useState(false);
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

  const intl = useIntl();
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
          onMouseEnter={() => setIsPopoverHovered(true)}
          onMouseLeave={() => setIsPopoverHovered(false)}
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
          placeholder={intl.formatMessage({
            id: 'tim-kiem-ten-nha-hang-hoac-ten-mon-an',
          })}
          inputClassName={css.keywordSearchForm}
          fullWidth
        />
      </div>
    </Tooltip>
  );
}

export default KeywordSearchSection;
