import Button from '@components/Button/Button';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { renderDateRange } from '@utils/dates';
import type { TObject } from '@utils/types';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import AddOrderForm from './AddOrderForm';
import css from './BookerOrderDetailsManageOrdersSection.module.scss';
import OrderDetailsTable from './OrderDetailsTable';

type TBookerOrderDetailsManageOrdersSectionProps = {
  data: {
    planData: TObject;
    startDate: number;
    endDate: number;
  };
};

const BookerOrderDetailsManageOrdersSection: React.FC<
  TBookerOrderDetailsManageOrdersSectionProps
> = (props) => {
  const {
    data: { /* planData, */ startDate, endDate },
  } = props;

  const intl = useIntl();
  const [currentViewDate, setCurrentViewDate] = useState(
    new Date().getTime().toString(),
  );
  const dateList = renderDateRange(startDate, endDate);
  console.log(currentViewDate);

  const items = dateList.map((date) => {
    const formattedDate = DateTime.fromMillis(date).toFormat('EEE, dd/MM', {
      locale: 'vi',
    });

    return {
      label: <div>{formattedDate}</div>,
      children: (
        <div className={css.manageOrdersContainer}>
          <div className={css.title}>
            {intl.formatMessage({
              id: 'BookerOrderDetailsManageOrdersSection.manageOrdersContainer.title',
            })}
          </div>
          <div className={css.orderDetails}>
            <OrderDetailsTable />
          </div>
          <div className={css.addOrder}>
            <div className={css.addOrderTitle}>
              {intl.formatMessage({
                id: 'BookerOrderDetailsManageOrdersSection.addOrder.title',
              })}
              <AddOrderForm onSubmit={() => {}} />
            </div>
          </div>
          <div className={css.addRequirement}>
            <Button
              variant="inline"
              type="button"
              className={css.addRequirementBtn}>
              <IconPlus className={css.plusIcon} />
              <span>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsManageOrdersSection.addRequirement.text',
                })}
              </span>
            </Button>
          </div>
        </div>
      ),
      id: date.toString(),
    };
  });

  const handleDateTabChange = ({ id }: TTabsItem) => {
    setCurrentViewDate(id as string);
  };

  return (
    <div className={css.root}>
      <Tabs items={items} onChange={handleDateTabChange} showNavigation />
    </div>
  );
};

export default BookerOrderDetailsManageOrdersSection;
