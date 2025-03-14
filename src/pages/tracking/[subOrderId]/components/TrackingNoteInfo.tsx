import Skeleton from 'react-loading-skeleton';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './TrackingNoteInfo.module.scss';

type TTrackingOrderInfoProps = {};

const TrackingNoteInfo: React.FC<TTrackingOrderInfoProps> = () => {
  const order = useAppSelector((state) => state.TrackingPage.order);
  const loadDataInProgress = useAppSelector(
    (state) => state.TrackingPage.loadDataInProgress,
  );

  const { orderDetailOfDate } = order;
  const orderGetter = Listing(order as TListing);
  const { orderNote: bookerOrderNote } = orderGetter.getMetadata();
  const { note: bookerSubOrderNote } = orderDetailOfDate || {};

  return (
    <RenderWhen condition={loadDataInProgress}>
      <Skeleton className={css.loading} />

      <RenderWhen.False>
        <div className="flex flex-col w-full gap-2">
          {bookerOrderNote && (
            <div className="rounded-lg bg-blue-50 p-4 whitespace-pre border border-solid border-blue-500">
              <div className="text-lg uppercase mb-1 font-bold">
                Ghi chú đơn hàng
              </div>
              <div>{bookerOrderNote}</div>
            </div>
          )}
          {bookerSubOrderNote && (
            <div className="rounded-lg bg-blue-50 p-4 whitespace-pre border border-solid border-blue-500">
              <div className="text-lg uppercase mb-1 font-bold">
                Ghi chú ngày ăn
              </div>
              <div>{bookerSubOrderNote}</div>
            </div>
          )}
        </div>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default TrackingNoteInfo;
