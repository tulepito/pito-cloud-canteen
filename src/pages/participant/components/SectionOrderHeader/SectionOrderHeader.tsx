import React from 'react';
import { useIntl } from 'react-intl';

import { VIEWS } from '../../helpers/constants';

import css from './SectionOrderHeader.module.scss';

type TSectionOrderHeaderProps = {
  setViewFunction: (view: string) => void;
  currentView: string;
};

// eslint-disable-next-line unused-imports/no-unused-vars
const LIST_VIEW = [
  {
    key: VIEWS.LIST,
    label: 'SectionOrderHeader.list',
  },
  {
    key: VIEWS.CALENDAR,
    label: 'SectionOrderHeader.calendar',
  },
];

const SectionOrderHeader: React.FC<TSectionOrderHeaderProps> = () => {
  // const { currentView, setViewFunction } = props;

  const intl = useIntl();
  const title = intl.formatMessage({
    id: 'SectionOrderHeader.title',
  });
  const contactNotification = intl.formatMessage({
    id: 'SectionOrderHeader.contactNotification',
  });

  // const viewNamesGroupFn = useCallback(() => {
  //   return LIST_VIEW.map((view) => {
  //     const { key, label } = view;
  //     return (
  //       <Button
  //         key={key}
  //         onClick={() => {
  //           setViewFunction(key);
  //         }}
  //         className={classNames(css.viewMode, {
  //           [css.activeViewMode]: currentView === key,
  //         })}>
  //         {intl.formatMessage({ id: label })}
  //       </Button>
  //     );
  //   });
  // }, [currentView]);

  return (
    <div className={css.root}>
      <div className={css.sectionLeft}>
        <p>{title}</p>
        <p>{contactNotification}</p>
      </div>
      <div className={css.sectionRight}>
        {/* <div className={css.viewModeGroup}>{viewNamesGroupFn()}</div> */}
      </div>
    </div>
  );
};

export default SectionOrderHeader;
