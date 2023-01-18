import Collapsible from '@components/Collapsible/Collapsible';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import css from './ReviewOrderDetailsSection.module.scss';

type TReviewOrderDetailsSectionProps = { className?: string };

const ReviewOrderDetailsSection: React.FC<TReviewOrderDetailsSectionProps> = (
  props,
) => {
  const { className } = props;
  const intl = useIntl();
  const [isCollapsed, setIsCollapsed] = useState([1]);

  const rootClasses = classNames(css.root, className);
  const groupTitleClasses = classNames(css.groupTitle, {
    [css.collapsed]: isCollapsed[0],
  });

  const handleClickGroupTitle = () => {
    const nextState = isCollapsed[0] === 0 ? [1] : [0];
    setIsCollapsed(nextState);
  };

  return (
    <Collapsible
      className={rootClasses}
      label={intl.formatMessage({ id: 'ReviewOrderDetailsSection.title' })}>
      <div className={css.tableContainer}>
        <div className={css.tableHead}>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.no',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.foodType',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.unit',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.quantity',
            })}
          </div>

          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.price',
            })}
          </div>
          <div></div>
        </div>

        <div className={css.tableBody}>
          <div className={css.tableRowGroup}>
            <div className={groupTitleClasses}>
              <div>a</div>
              <div>b</div>
              <div>c</div>
              <div>c</div>
              <div>d</div>
              <div className={css.actionCell} onClick={handleClickGroupTitle}>
                <IconArrow direction={isCollapsed[0] === 0 ? 'up' : 'down'} />
              </div>
            </div>
            <div className={css.rows}>
              <div className={css.row}>
                <div></div>
                <div>b</div>
                <div>c</div>
                <div>c</div>
                <div>d</div>
                <div>e</div>
              </div>
              <div className={css.row}>
                <div></div>
                <div>b</div>
                <div>c</div>
                <div>c</div>
                <div>d</div>
                <div>e</div>
              </div>
              <div className={css.row}>
                <div></div>
                <div>b</div>
                <div>c</div>
                <div>c</div>
                <div>d</div>
                <div>e</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Collapsible>
  );
};

export default ReviewOrderDetailsSection;
