import React from 'react';
import { FormattedMessage } from 'react-intl';

import IconBibimbap from '@components/Icons/IconBibimbap/IconBibimbap';
import NamedLink from '@components/NamedLink/NamedLink';

import css from './NewsSection.module.scss';

const NewsSection = () => {
  return (
    <div className={css.root}>
      <h3 className={css.title}>
        <FormattedMessage id="NewsSection.title" />
      </h3>
      <div className={css.container}>
        <div className={css.background}>
          <IconBibimbap className={css.icon} />
        </div>
        <div className={css.content}>
          <h5 className={css.contentLabel}>Lorem ipsum dolor met </h5>
          <p className={css.contentDescription}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius ipsa
            officia suscipit sapiente, vel magni ipsum atque nisi eaque, nemo,
            impedit dicta adipisci non odio molestiae sint quis corporis. Omnis!
          </p>
          <NamedLink className={css.link}>
            <FormattedMessage id="NewsSection.link" />
          </NamedLink>
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
