import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconGroup from '@components/Icons/IconGroup/IconGroup';
import IconMoney from '@components/Icons/IconMoney/IconMoney';
import IconReceipt from '@components/Icons/IconReceipt/IconReceipt';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { timePeriodOptions } from '@pages/partner/hooks/useControlTimeRange';
import type { ETimePeriodOption } from '@src/utils/enums';
import { EFluctuationType } from '@src/utils/enums';
import { getLabelByKey } from '@src/utils/options';

import SelectTimePeriodModal from './SelectTimePeriodModal/SelectTimePeriodModal';
import TotalStatisticItem from './TotalStatisticItem/TotalStatisticItem';

import css from './Overview.module.scss';

type TOverviewProps = {
  data: {
    totalRevenue: number;
    totalCustomer: number;
    totalOrders: number;
  };

  previousData: {
    totalRevenue: number;
    totalCustomer: number;
    totalOrders: number;
  };
  timePeriodOption: ETimePeriodOption;
  inProgress?: boolean;
  handleTimePeriodChange: (timePeriod: ETimePeriodOption) => void;
  startDate: number;
  endDate: number;
  setStartDate: (startDate: number) => void;
  setEndDate: (endDate: number) => void;
};

const getFluctuation = (current: number, previous: number) => {
  if (current > previous) {
    return EFluctuationType.INCREASE;
  }

  if (current < previous) {
    return EFluctuationType.DECREASE;
  }

  return EFluctuationType.EQUAL;
};

const Overview: React.FC<TOverviewProps> = (props) => {
  const {
    data,
    previousData,
    timePeriodOption,
    inProgress,
    handleTimePeriodChange,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = props;
  const { totalRevenue, totalCustomer, totalOrders } = data;
  const {
    totalRevenue: previousTotalRevenue,
    totalCustomer: previousTotalCustomer,
    totalOrders: previousTotalOrders,
  } = previousData;
  const selectTimePeriodController = useBoolean();
  const { isMobileLayout } = useViewport();

  const onTimePeriodHandleClick = (e: any) => {
    e.stopPropagation();
    selectTimePeriodController.setTrue();
  };

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div className={css.title}>TỔNG QUAN</div>
        <div
          className={css.timePeriodSelectWrapper}
          onClick={onTimePeriodHandleClick}>
          <RenderWhen condition={timePeriodOption === 'custom'}>
            Tuỳ chỉnh
            <RenderWhen.False>
              {getLabelByKey(timePeriodOptions, timePeriodOption)}
            </RenderWhen.False>
          </RenderWhen>

          <IconArrow
            direction="down"
            className={classNames(
              css.arrowIcon,
              selectTimePeriodController.value && css.active,
            )}
          />
          <RenderWhen condition={selectTimePeriodController.value}>
            <div className={css.timePeriodSelectModalWrapper}>
              <SelectTimePeriodModal
                isOpen={selectTimePeriodController.value}
                onClose={selectTimePeriodController.setFalse}
                isMobileLayout={isMobileLayout}
                handleTimePeriodChange={handleTimePeriodChange}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
            </div>
          </RenderWhen>
        </div>
      </div>
      <RenderWhen condition={!inProgress}>
        <div className={css.desktopItemWrapper}>
          <TotalStatisticItem
            icon={<IconMoney />}
            title="Tổng doanh thu"
            value={`${parseThousandNumber(totalRevenue)}đ`}
            fluctuation={getFluctuation(totalRevenue, previousTotalRevenue)}
            valueWrapperClassName={css.revenueValueWrapper}
            isDesktop
          />
          <TotalStatisticItem
            icon={<IconGroup />}
            title="Tổng khách hàng"
            value={totalCustomer}
            fluctuation={getFluctuation(totalCustomer, previousTotalCustomer)}
            isDesktop
          />
          <TotalStatisticItem
            icon={<IconReceipt className={css.receiptIcon} />}
            title="Tổng đơn hàng"
            value={totalOrders}
            fluctuation={getFluctuation(totalOrders, previousTotalOrders)}
            isDesktop
          />
        </div>
        <div className={css.itemWrapper}>
          <TotalStatisticItem
            icon={<IconMoney />}
            title="Tổng doanh thu"
            value={`${parseThousandNumber(totalRevenue)}đ`}
            fluctuation={getFluctuation(totalRevenue, previousTotalRevenue)}
            valueWrapperClassName={css.revenueValueWrapper}
          />
          <div className={css.row}>
            <TotalStatisticItem
              icon={<IconGroup />}
              title="Tổng khách hàng"
              value={totalCustomer}
              fluctuation={getFluctuation(totalCustomer, previousTotalCustomer)}
              className={css.item}
            />
            <TotalStatisticItem
              icon={<IconReceipt className={css.receiptIcon} />}
              title="Tổng đơn hàng"
              value={totalOrders}
              fluctuation={getFluctuation(totalOrders, previousTotalOrders)}
              className={css.item}
            />
          </div>
        </div>
        <RenderWhen.False>
          <RenderWhen.False>
            <Skeleton className={css.loading} />
          </RenderWhen.False>
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default Overview;
