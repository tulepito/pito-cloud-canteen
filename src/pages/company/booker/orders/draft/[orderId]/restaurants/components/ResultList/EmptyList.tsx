import Button from '@components/Button/Button';
import IconPhone from '@components/Icons/IconPhone/IconPhone';
import Image from 'next/image';
import React from 'react';
import { useIntl } from 'react-intl';

import emptyResultImg from './assets/emptyResult.png';
import css from './ResultList.module.scss';

const EmptyList: React.FC = () => {
  const intl = useIntl();

  return (
    <div className={css.emptyResult}>
      <div className={css.emptyResultImg}>
        <Image src={emptyResultImg} alt="empty result" />
      </div>
      <div className={css.emptyTitle}>
        <p>
          {intl.formatMessage({
            id: 'BookerSelectRestaurant.ResultList.emptyResult.title',
          })}
        </p>
        <p className={css.emptyContent}>
          {intl.formatMessage({
            id: 'BookerSelectRestaurant.ResultList.emptyResult.content',
          })}
        </p>
        <Button className={css.contactUsBtn} variant="secondary">
          <IconPhone className={css.contactUsIcon} />
          {intl.formatMessage({
            id: 'BookerSelectRestaurant.ResultList.emptyResult.contactUs',
          })}
        </Button>
      </div>
    </div>
  );
};

export default EmptyList;
