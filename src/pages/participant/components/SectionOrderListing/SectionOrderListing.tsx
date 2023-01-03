import ListingCard from '@components/ListingCard/ListingCard';
import Tabs from '@components/Tabs/Tabs';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './SectionOrderListing.module.scss';

type TSectionOrderListingProps = {};
const mockListing = {
  attributes: {
    title: 'Hàu sữa nướng phô mai',
    description:
      'Food description in a restaurant in Italy all you get from your waiter is a stare.',
  },
};

const SectionOrderListing: React.FC<TSectionOrderListingProps> = () => {
  const intl = useIntl();
  const autoSelectionButtonLabel = intl.formatMessage({
    id: 'SectionOrderListing.autoSelectionButtonLabel',
  });
  const unCheckThisDateButtonLabel = intl.formatMessage({
    id: 'SectionOrderListing.unCheckThisDateButtonLabel',
  });
  const tabItems = [
    {
      label: 'Thứ 2, 21/11',
      key: 'mon',
      children: (
        <>
          {/* <div className={css.dishSelectionButtons}>
            <Button>{autoSelectionButtonLabel}</Button>
            <InlineTextButton>{unCheckThisDateButtonLabel}</InlineTextButton>
          </div>
          <div>
            <ListingCard className={css.listingCard} listing={mockListing} />
            <ListingCard className={css.listingCard} listing={mockListing} />
            <ListingCard className={css.listingCard} listing={mockListing} />
          </div> */}
          <>
            <ListingCard className={css.listingCard} listing={mockListing} />
            <ListingCard className={css.listingCard} listing={mockListing} />
          </>
        </>
      ),
    },
    {
      label: 'Thứ 3, 22/11',
      key: 'tue',
      children: (
        <>
          <ListingCard className={css.listingCard} listing={mockListing} />
          <ListingCard className={css.listingCard} listing={mockListing} />
          <ListingCard className={css.listingCard} listing={mockListing} />
          <ListingCard className={css.listingCard} listing={mockListing} />
          <ListingCard className={css.listingCard} listing={mockListing} />
        </>
      ),
    },
    {
      label: 'Thứ 4, 23/11',
      key: 'wed',
      children: (
        <ListingCard className={css.listingCard} listing={mockListing} />
      ),
    },
    {
      label: 'Thứ 5, 24/11',
      key: 'thur',
      children: (
        <ListingCard className={css.listingCard} listing={mockListing} />
      ),
    },
    {
      label: 'Thứ 6, 25/11',
      key: 'fri',
      children: null,
    },
  ];

  const onUnCheckDishCurrentDate = (date) => {
    // TODO: handle logic uncheck dish
    console.log({ date });
  };
  return (
    <div className={css.root}>
      <div className={css.sectionOrderNotify}>
        <FormattedMessage id="SectionOrderListing.sectionOrderNotify" />
      </div>
      <div className={css.sectionMainOrder}>
        <Tabs
          items={tabItems}
          defaultActiveKey="2"
          contentClassName={css.sectionMainOrderListings}
          headerClassName={css.sectionMainOrderHeader}
        />
      </div>
    </div>
  );
};

export default SectionOrderListing;
