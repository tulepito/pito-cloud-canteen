import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';

import { VIEWS } from '../../helpers/constants';

import css from './SectionOrderHeader.module.scss';

type TSectionOrderHeaderProps = {
  setViewFunction?: (view: string) => void;
  currentView?: string;
  showToggle?: boolean;
};

export const LIST_VIEW = [
  {
    key: VIEWS.LIST,
    label: 'SectionOrderHeader.list',
  },
  {
    key: VIEWS.CALENDAR,
    label: 'SectionOrderHeader.calendar',
  },
];

const SectionOrderHeader: React.FC<TSectionOrderHeaderProps> = (props) => {
  const { currentView, setViewFunction, showToggle } = props;

  const intl = useIntl();
  const title = intl.formatMessage({
    id: 'SectionOrderHeader.title',
  });
  const contactNotification = intl.formatMessage({
    id: 'SectionOrderHeader.contactNotification',
  });

  const viewNamesGroupFn = useCallback(() => {
    return LIST_VIEW.map((view) => {
      const { key, label } = view;

      return (
        <Button
          key={key}
          onClick={() => {
            setViewFunction?.(key);
          }}
          className={classNames(css.viewMode, {
            [css.activeViewMode]: currentView === key,
          })}>
          {intl.formatMessage({ id: label })}
        </Button>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  return (
    <div className={css.root}>
      <div className={css.sectionLeft}>
        <p>{title}</p>
        <p>{contactNotification}</p>
      </div>
      <div className={css.sectionRight}>
        {showToggle && (
          <div className={css.viewModeGroup}>{viewNamesGroupFn()}</div>
        )}
      </div>
    </div>
  );
};

export default SectionOrderHeader;
