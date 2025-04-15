import { startOfDay } from 'date-fns';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@components/ui/dialog';
import type { OrderDetail, OrderDetailValue } from '@src/types';
import { ETransition } from '@src/utils/transaction';

function OrderDetailTrackingSection({
  orderDetail,
}: {
  orderDetail: OrderDetail;
}) {
  const todayOrderDetail = orderDetail[
    startOfDay(new Date()).getTime()
  ] as OrderDetailValue;
  const lastTransition = todayOrderDetail?.lastTransition;
  const todayTrackingLink = todayOrderDetail?.trackingLink;

  return (
    <RenderWhen
      condition={
        !!todayTrackingLink && lastTransition === ETransition.START_DELIVERY
      }>
      <Dialog>
        <DialogTrigger className="w-full">
          <Button
            size="lg"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 w-full">
            <div className="flex items-center gap-2">
              <img
                src="/images/deliverying.gif"
                alt="deliverying"
                className="w-[40px] h-[40px]"
              />
              <span className="text-base font-semibold hidden md:block">
                Đơn hàng hôm nay đang trên đường giao tới. Theo dõi đơn hàng
              </span>
              <span className="text-base font-semibold md:hidden">
                Theo dõi đơn hàng
              </span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh] min-w-[80vw] min-h-[80vh]">
          <DialogHeader>
            <iframe src={todayTrackingLink} className="w-full h-full" />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </RenderWhen>
  );
}

export default OrderDetailTrackingSection;
