import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';

import Collapsible from '@components/Collapsible/Collapsible';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { formatTimestamp } from '@src/utils/dates';

import css from './TrackingDeliveryInfo.module.scss';

type TTrackingDeliveryInfoProps = { subOrderDate: number | string };

const TrackingDeliveryInfo: React.FC<TTrackingDeliveryInfoProps> = ({
  subOrderDate,
}) => {
  const intl = useIntl();
  const loadDataInProgress = useAppSelector(
    (state) => state.TrackingPage.loadDataInProgress,
  );

  const rowData = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: 'Tracking.DeliveryInfo.deliveryTime' }),
        value: `${formatTimestamp(Number(subOrderDate))}`,
      },
    ];
  }, [intl, subOrderDate]);

  return (
    <Collapsible
      label={intl.formatMessage({
        id: 'Tracking.DeliveryInfo.title',
      })}>
      <div className={css.rows}>
        {rowData.map(({ label, value }, index) => {
          return (
            <div key={index} className={css.rowInfo}>
              <div className={css.label}>
                {index + 1}. {label}
              </div>
              <RenderWhen condition={loadDataInProgress}>
                <Skeleton key={index} className={css.rowDataLoading} />
                <RenderWhen.False>
                  <div className={css.value}>{value}</div>
                </RenderWhen.False>
              </RenderWhen>
            </div>
          );
        })}
      </div>
    </Collapsible>
  );
};

export default TrackingDeliveryInfo;
