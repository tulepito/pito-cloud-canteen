import { Fragment } from 'react';
import classNames from 'classnames';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TKeyValue } from '@src/utils/types';

import css from './StepTabs.module.scss';

type TStepTabsProps = {
  tabs: TKeyValue[];
  currentTab: string;
  moveableSteps?: string[];
  setCurrentTab: (tab: string) => void;
};

type TTabProps = {
  tabNumber: number;
  tabLabel: string;
  isActive?: boolean;
  handleTabClick?: () => void;
};
const Tab: React.FC<TTabProps> = (props) => {
  const { tabNumber, tabLabel, isActive, handleTabClick } = props;

  return (
    <div
      className={classNames(css.tabWrapper, isActive && css.active)}
      onClick={handleTabClick}>
      <div className={css.tabNumber}>{tabNumber}</div>
      <div className={css.tabLabel}>{tabLabel}</div>
    </div>
  );
};

const StepTabs: React.FC<TStepTabsProps> = (props) => {
  const { tabs, currentTab, setCurrentTab, moveableSteps } = props;

  return (
    <div className={css.root}>
      {tabs.map((tab, index) => {
        const handleTabClick = () => {
          if (tab.key === currentTab) {
            return;
          }
          if (moveableSteps && moveableSteps.includes(tab.key)) {
            setCurrentTab(tab.key);
          }
        };

        return (
          <Fragment key={index}>
            <Tab
              key={index}
              tabNumber={index + 1}
              tabLabel={tab.label}
              isActive={tab.key === currentTab}
              handleTabClick={handleTabClick}
            />
            <RenderWhen
              key={`connector-${index}`}
              condition={index !== tabs.length - 1}>
              <div className={css.connector}></div>
            </RenderWhen>
          </Fragment>
        );
      })}
    </div>
  );
};

export default StepTabs;
