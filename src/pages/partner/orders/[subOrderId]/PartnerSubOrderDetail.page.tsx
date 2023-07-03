/* eslint-disable import/no-cycle */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';

import SubOrderCart from './components/SubOrderCart';
import SubOrderDetail from './components/SubOrderDetail';
import SubOrderInfo from './components/SubOrderInfo';
import SubOrderNote from './components/SubOrderNote';
import SubOrderSummary from './components/SubOrderSummary';
import SubOrderTitle from './components/SubOrderTitle';
import { PartnerSubOrderDetailThunks } from './PartnerSubOrderDetail.slice';

import css from './PartnerSubOrderDetailPage.module.scss';

type TPartnerSubOrderDetailPageProps = {};
export enum EPartnerSubOrderDetailPage {
  summary = 'summary',
  detail = 'detail',
}

const PartnerSubOrderDetailPage: React.FC<
  TPartnerSubOrderDetailPageProps
> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState(EPartnerSubOrderDetailPage.summary);
  const {
    query: { subOrderId },
    isReady,
  } = router;

  const isSummaryViewMode = viewMode === EPartnerSubOrderDetailPage.summary;

  const handleChangeViewMode =
    (_viewMode: EPartnerSubOrderDetailPage) => () => {
      setViewMode(_viewMode);
    };

  useEffect(() => {
    if (subOrderId && isReady) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const [orderId, date] = (subOrderId as string)?.split('_');

      dispatch(PartnerSubOrderDetailThunks.loadData({ orderId, date }));
      dispatch(orderManagementThunks.loadData(orderId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, subOrderId]);

  return (
    <div className={css.root}>
      <SubOrderTitle />
      <RenderWhen condition={isSummaryViewMode}>
        <div className={css.container}>
          <div className={css.leftPart}>
            <SubOrderInfo />
            <SubOrderSummary onChangeViewMode={handleChangeViewMode} />
            <SubOrderNote />
          </div>
          <div className={css.rightPart}>
            <SubOrderCart />
          </div>
        </div>

        <RenderWhen.False>
          <SubOrderDetail onChangeViewMode={handleChangeViewMode} />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default PartnerSubOrderDetailPage;
