import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconMoney from '@components/Icons/IconMoney/IconMoney';
import IconReceipt from '@components/Icons/IconReceipt/IconReceipt';
import IconUser from '@components/Icons/IconUser/IconUser';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import useBoolean from '@hooks/useBoolean';
import {
  timePeriodOptions,
  useControlTimeRange,
} from '@pages/partner/hooks/useControlTimeRange';
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
};

const Overview: React.FC<TOverviewProps> = (props) => {
  const { data } = props;
  const { totalRevenue, totalCustomer, totalOrders } = data;
  const selectTimePeriodController = useBoolean();
  const { timePeriodOption } = useControlTimeRange();

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div className={css.title}>TỔNG QUAN</div>
        <div
          className={css.timePeriodSelectWrapper}
          onClick={selectTimePeriodController.setTrue}>
          <RenderWhen condition={timePeriodOption === 'custom'}>
            Tuỳ chỉnh
            <RenderWhen.False>
              {getLabelByKey(timePeriodOptions, timePeriodOption)}
            </RenderWhen.False>
          </RenderWhen>

          <IconArrow direction="down" />
        </div>
      </div>
      <TotalStatisticItem
        icon={<IconMoney />}
        title="Tổng doanh thu"
        value={`${parseThousandNumber(totalRevenue)}đ`}
        fluctuation={EFluctuationType.INCREASE}
      />
      <div className={css.row}>
        <TotalStatisticItem
          icon={<IconUser variant="multiUser" />}
          title="Tổng khách hàng"
          value={totalCustomer}
          fluctuation={EFluctuationType.INCREASE}
          className={css.item}
        />
        <TotalStatisticItem
          icon={<IconReceipt />}
          title="Tổng đơn hàng"
          value={totalOrders}
          fluctuation={EFluctuationType.DECREASE}
          className={css.item}
        />
      </div>
      <SelectTimePeriodModal
        isOpen={selectTimePeriodController.value}
        onClose={selectTimePeriodController.setFalse}
      />
    </div>
  );
};

export default Overview;
