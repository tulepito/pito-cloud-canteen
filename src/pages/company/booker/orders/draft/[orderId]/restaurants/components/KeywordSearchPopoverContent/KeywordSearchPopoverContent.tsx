import type { PropsWithChildren } from 'react';
import React from 'react';

import Chip from '@components/Chip/Chip';
import IconClose from '@components/Icons/IconClose/IconClose';

import css from './KeywordSearchPopoverContent.module.scss';

function ChipList(props: PropsWithChildren<{}>) {
  const { children } = props;

  return <div className={css.chipList}>{children}</div>;
}

function KeywordSearchPopoverContentSection(
  props: PropsWithChildren<{ title: string }>,
) {
  const { children, title } = props;

  return (
    <div className={css.section}>
      <p className={css.title}>{title}</p>

      {children}
    </div>
  );
}

function RecentKeywordsListItem(
  props: PropsWithChildren<{
    onClick: () => void;
    onDelete: () => void;
  }>,
) {
  const { children, onClick, onDelete } = props;

  return (
    <li className={css.recentKeywordsListItem} onClick={onClick}>
      {children}
      <div
        className={css.iconButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}>
        <IconClose />
      </div>
    </li>
  );
}

function RecentKeywordsList(props: PropsWithChildren<{}>) {
  const { children } = props;

  return <ul className={css.recentKeywordsList}>{children}</ul>;
}

interface KeywordSearchPopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  recentKeywords: string[];
  popularKeywords: string[];
  onKeyWordsChange: (keyword: string) => void;
  onDeleteRecentKeyword: (keyword: string) => void;
}

function KeywordSearchPopoverContent({
  recentKeywords,
  popularKeywords,
  onKeyWordsChange,
  onDeleteRecentKeyword,
  ...divProps
}: KeywordSearchPopoverContentProps) {
  const hasRecentKeyWords = recentKeywords.length > 0;
  const hasPopularKeywords = popularKeywords.length > 0;

  return (
    <div className={css.root} {...divProps}>
      {hasRecentKeyWords && (
        <KeywordSearchPopoverContentSection title="Tìm kiếm gần đây">
          <RecentKeywordsList>
            {recentKeywords.map((keyword) => (
              <RecentKeywordsListItem
                key={keyword}
                onClick={() => onKeyWordsChange(keyword)}
                onDelete={() => onDeleteRecentKeyword(keyword)}>
                {keyword}
              </RecentKeywordsListItem>
            ))}
          </RecentKeywordsList>
        </KeywordSearchPopoverContentSection>
      )}
      {hasRecentKeyWords && hasPopularKeywords && (
        <div className={css.divider}></div>
      )}
      {hasPopularKeywords && (
        <KeywordSearchPopoverContentSection title="Tìm kiếm phổ biến">
          <ChipList>
            {popularKeywords.map((keyword) => (
              <Chip
                label={keyword}
                key={keyword}
                onClick={() => onKeyWordsChange(keyword)}
              />
            ))}
          </ChipList>
        </KeywordSearchPopoverContentSection>
      )}
    </div>
  );
}

export default KeywordSearchPopoverContent;
