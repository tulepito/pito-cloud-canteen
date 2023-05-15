import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';

import SubOrderList from './components/SubOrderList/SubOrderList';
import SubOrderReviewModal from './components/SubOrderReviewModal/SubOrderReviewModal';
import { SubOrdersThunks } from './SubOrders.slice';

import css from './SubOrders.module.scss';

const DELIVERING_TAB = 'delivering';
const DELIVERED_TAB = 'delivered';

const SubOrders = () => {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState(DELIVERING_TAB);
  const [selectedSubOrder, setSelectedSubOrder] = useState<any>(null);
  const subOrderReviewModalControl = useBoolean();
  const currentUser = useAppSelector(currentUserSelector);
  const currentUserGetter = CurrentUser(currentUser);
  const currentUserId = currentUserGetter.getId();

  const deliveredSubOrders = useAppSelector(
    (state) => state.ParticipantSubOrderList.deliveredSubOrders,
    shallowEqual,
  );
  const deliveringSubOrders = useAppSelector(
    (state) => state.ParticipantSubOrderList.deliveringSubOrders,
    shallowEqual,
  );
  const deliveringSubOrderLastRecord =
    deliveringSubOrders[deliveringSubOrders.length - 1]?.createdAt?.second;
  const deliveredSubOrderLastRecord =
    deliveredSubOrders[deliveredSubOrders.length - 1]?.createdAt?.second;

  const fetchSubOrdersInProgress = useAppSelector(
    (state) => state.ParticipantSubOrderList.fetchSubOrdersInProgress,
  );

  useEffect(() => {
    dispatch(
      SubOrdersThunks.fetchSubOrdersFromFirebase({
        participantId: currentUserId,
        txStatus: activeTab,
      }),
    );
  }, [activeTab, currentUserId, dispatch]);
  const tabItems = [
    {
      key: DELIVERING_TAB,
      label: 'Đang giao hàng',
      childrenFn: (props: any) => (
        <div>
          <SubOrderList {...props} />
        </div>
      ),
      childrenProps: {
        subOrders: deliveringSubOrders,
        lastRecord: deliveringSubOrderLastRecord,
      },
    },
    {
      key: DELIVERED_TAB,
      label: 'Đã giao hàng',
      childrenFn: (props: any) => (
        <div>
          <SubOrderList {...props} />
        </div>
      ),
      childrenProps: {
        subOrders: deliveredSubOrders,
        lastRecord: deliveredSubOrderLastRecord,
        setSelectedSubOrder,
        openSubOrderReviewModal: subOrderReviewModalControl.setTrue,
      },
    },
  ];

  const onTabChange = (tab: any) => {
    setActiveTab(tab?.key);
  };

  return (
    <div className={css.container}>
      <div className={css.title}>Món đã đặt</div>
      <Tabs items={tabItems as any} onChange={onTabChange} />
      <LoadingModal isOpen={fetchSubOrdersInProgress} />
      <RenderWhen condition={activeTab === DELIVERED_TAB && !!selectedSubOrder}>
        <SubOrderReviewModal
          isOpen={subOrderReviewModalControl.value}
          onClose={subOrderReviewModalControl.setFalse}
          subOrder={selectedSubOrder}
        />
      </RenderWhen>
      <BottomNavigationBar />
    </div>
  );
};

export default SubOrders;
