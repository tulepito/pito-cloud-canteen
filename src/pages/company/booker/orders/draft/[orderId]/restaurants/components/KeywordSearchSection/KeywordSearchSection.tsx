import React, { useMemo } from 'react';
import { useRouter } from 'next/router';

import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';

function KeywordSearchSection() {
  const router = useRouter();
  const { keywords } = router.query;

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

  return (
    <KeywordSearchForm
      onSubmit={onSearchKeywordsSubmit}
      initialValues={keywordsInitialValue}
    />
  );
}

export default KeywordSearchSection;
