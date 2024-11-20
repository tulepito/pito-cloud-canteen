import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconNoteBook from '@components/Icons/IconNoteBook/IconNoteBook';
import IconNoteCheckList from '@components/Icons/IconNoteCheckList/IconNoteCheckList';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { findDeliveryDate } from '@helpers/order/prepareDataHelper';
import type { TUseBooleanReturns } from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { FORMATTED_WEEKDAY } from '@src/utils/constants';
import { formatTimestamp } from '@src/utils/dates';
import type { TDefaultProps } from '@src/utils/types';

import type { TAutomaticPickingFormValues } from './AutomaticPickingForm';
import AutomaticPickingForm from './AutomaticPickingForm';

import css from './AutomaticStartOrInfoSection.module.scss';

type TAutomaticStartOrInfoSectionProps = TDefaultProps & {
  startDate: number;
  deliveryHour: string;
  handleAutoPickingChange?: () => void;
  mobileModalControl: TUseBooleanReturns;
  autoPickingFormInitialValues?: TAutomaticPickingFormValues;
  disabled?: boolean;
};

const AutomaticStartOrInfoSection: React.FC<
  TAutomaticStartOrInfoSectionProps
> = ({
  startDate,
  deliveryHour,
  className,
  handleAutoPickingChange = console.info,
  mobileModalControl,
  autoPickingFormInitialValues = {},
  disabled,
}) => {
  const classes = classNames(css.container, className);
  const { isMobileLayout } = useViewport();

  const deliveryDate = findDeliveryDate(startDate, deliveryHour);

  const automaticConfirmDate = DateTime.fromMillis(Number(deliveryDate)).minus({
    hours:
      +process.env
        .NEXT_PUBLIC_ORDER_AUTO_START_TIME_TO_DELIVERY_TIME_OFFSET_IN_HOUR,
  });

  const formattedAutomaticConfirmOrder = `${formatTimestamp(
    automaticConfirmDate.toMillis(),
    'HH:mm',
  )} ${FORMATTED_WEEKDAY[automaticConfirmDate.weekday]}, ${formatTimestamp(
    automaticConfirmDate.toMillis(),
    'dd/MM/yyyy',
  )}`;

  const contentComponent = (
    <div className={classes}>
      <div className={css.column}>
        <IconNoteCheckList />
        <div>
          <div className={css.columnTitle}>Tự động đặt đơn</div>
          <div>
            Đơn sẽ được tự động đặt vào lúc{' '}
            <b>{formattedAutomaticConfirmOrder}</b>. Trường hợp nếu đến hạn mà
            không đủ số lượng đặt món thì đơn sẽ bị hủy.
          </div>
        </div>
      </div>
      <div className={css.column}>
        <IconNoteBook />
        <div>
          <div className={css.columnTitle}>
            Tự động hủy tham gia cho thành viên
          </div>
          <div>
            Nếu quá thời hạn mà thành viên chưa chọn món thì sẽ được xem như là
            không tham gia ngày ăn.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <Modal
        shouldHideIconClose
        shouldFullScreenInMobile={false}
        isOpen={mobileModalControl.value}
        handleClose={mobileModalControl.setFalse}
        containerClassName={css.mobileModalContainer}
        contentClassName={css.mobileModalContent}>
        {contentComponent}
        <AutomaticPickingForm
          initialValues={autoPickingFormInitialValues}
          onSubmit={() => {}}
          disabled={disabled}
          handleFieldChange={handleAutoPickingChange}
        />
        <Button onClick={mobileModalControl.setFalse}>Tôi đã hiểu</Button>
      </Modal>
      <RenderWhen.False>{contentComponent}</RenderWhen.False>
    </RenderWhen>
  );
};

export default AutomaticStartOrInfoSection;
