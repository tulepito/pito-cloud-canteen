import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconNoteBook from '@components/Icons/IconNoteBook/IconNoteBook';
import IconNoteCheckList from '@components/Icons/IconNoteCheckList/IconNoteCheckList';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TUseBooleanReturns } from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { formatTimestamp } from '@src/utils/dates';
import { FORMATTED_WEEKDAY } from '@src/utils/options';
import type { TDefaultProps } from '@src/utils/types';

import type { TAutomaticPickingFormValues } from './AutomaticPickingForm';
import AutomaticPickingForm from './AutomaticPickingForm';

import css from './AutomaticStartOrInfoSection.module.scss';

type TAutomaticStartOrInfoSectionProps = TDefaultProps & {
  startDate: number;
  deliveryHour: string;
  handleAutoPickingChange?: () => {};
  mobileModalControl: TUseBooleanReturns;
  autoPickingFormInitialValues?: TAutomaticPickingFormValues;
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
}) => {
  const classes = classNames(css.container, className);
  const { isMobileLayout } = useViewport();

  const normalizedDeliveryHour = deliveryHour?.includes('-')
    ? deliveryHour.split('-')[0]
    : deliveryHour;
  const automaticConfirmDate = DateTime.fromMillis(Number(startDate)).minus({
    days: 1,
  });
  const formattedAutomaticConfirmOrder = `${
    FORMATTED_WEEKDAY[automaticConfirmDate.weekday]
  }, ${formatTimestamp(automaticConfirmDate.toMillis(), 'dd/MM/yyyy')}`;

  const contentComponent = (
    <div className={classes}>
      <div className={css.column}>
        <IconNoteCheckList />
        <div>
          <div className={css.columnTitle}>Tự động đặt đơn</div>
          <div>
            Đơn sẽ được tự động đặt vào lúc{' '}
            <b>
              {normalizedDeliveryHour} {formattedAutomaticConfirmOrder}
            </b>
            . Trường hợp nếu đến hạn mà không đủ số lượng đặt món thì đơn sẽ bị
            hủy.
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
          handleFieldChange={handleAutoPickingChange}
        />
        <Button onClick={mobileModalControl.setFalse}>Tôi đã hiểu</Button>
      </Modal>
      <RenderWhen.False>{contentComponent}</RenderWhen.False>
    </RenderWhen>
  );
};

export default AutomaticStartOrInfoSection;
