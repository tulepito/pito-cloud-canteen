import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import css from './ReviewOrder.module.scss';

const ReviewContent: React.FC<any> = (props) => {
  return <>Hello</>;
};

const ReviewOrder = () => {
  const mockDates: TTabsItem[] = [
    {
      key: '23/32/2022',
      label: '23/32/2022',
      children: (props) => <ReviewContent {...props} />,
    },
    {
      key: '23/32/2022',
      label: '23/32/2022',
      children: (props) => <ReviewContent {...props} />,
    },
    {
      key: '23/32/2022',
      label: '23/32/2022',
      children: (props) => <ReviewContent {...props} />,
    },
    {
      key: '23/32/2022',
      label: '23/32/2022',
      children: (props) => <ReviewContent {...props} />,
    },
    {
      key: '23/32/2022',
      label: '23/32/2022',
      children: (props) => <ReviewContent {...props} />,
    },
  ];

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ReviewOrder.title" />
      </h1>
      <Tabs items={mockDates} />
    </div>
  );
};

export default ReviewOrder;
