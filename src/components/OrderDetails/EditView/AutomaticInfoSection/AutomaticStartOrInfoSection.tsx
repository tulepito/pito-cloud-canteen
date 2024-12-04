import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
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
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="18" fill="#65DB63" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21.6859 11.7417C19.0234 10.1459 15.5158 10.4387 13.1613 12.5705L13.1612 12.5707C11.2054 14.336 10.3774 17.0291 10.998 19.5974C11.1129 20.0581 10.8273 20.5322 10.3604 20.648C10.2957 20.666 10.2275 20.6741 10.153 20.6741C9.74976 20.6741 9.40134 20.4011 9.30705 20.0096C8.53486 16.8243 9.56406 13.4784 11.993 11.2792C13.7601 9.67631 16.0491 8.86094 18.428 8.98217C20.0956 9.06569 21.6662 9.59371 23.0114 10.5168L22.9575 9.11238C22.9378 8.63284 23.314 8.22785 23.7953 8.20989C24.027 8.18925 24.2479 8.28173 24.4194 8.43978C24.5901 8.59782 24.6888 8.81334 24.6996 9.04681L24.8262 12.4565C24.8271 12.9998 24.459 13.3823 23.9902 13.4012L20.541 13.5296H20.5401C20.039 13.5296 19.6583 13.1614 19.6376 12.6918C19.6188 12.2131 19.9941 11.8072 20.4755 11.7884L21.6859 11.7417ZM26.8027 16.03V16.0318L26.803 16.0318C27.5743 19.2189 26.546 22.5638 24.117 24.7621C22.357 26.3515 20.1048 27.1849 17.6812 27.0592C16.0432 26.9756 14.4941 26.462 13.1579 25.5613L13.2747 26.8805C13.2971 27.1121 13.2271 27.3384 13.0771 27.5171C12.929 27.6949 12.7197 27.8045 12.4889 27.8269H12.4755C11.9555 27.8269 11.582 27.4794 11.5433 27.0376L11.2344 23.6036C11.1904 23.1277 11.5424 22.7029 12.0211 22.6562L15.4576 22.3464C15.9318 22.3024 16.361 22.6553 16.405 23.1348C16.4266 23.3665 16.3565 23.5937 16.2065 23.7724C16.0584 23.9502 15.8482 24.0607 15.6175 24.0822L14.2678 24.2043C15.4126 24.9317 16.756 25.3259 18.1326 25.3259C19.9142 25.3259 21.6257 24.6677 22.9485 23.4716C24.907 21.7035 25.7349 19.0104 25.1117 16.4431C25.0561 16.2204 25.092 15.986 25.2141 15.7866C25.3344 15.5891 25.5248 15.4481 25.7484 15.3924C25.9729 15.3377 26.2046 15.3727 26.4039 15.4912C26.6051 15.6124 26.7461 15.8028 26.8027 16.03Z"
            fill="white"
          />
        </svg>

        <div>
          <div className={css.columnTitle}>Tự động đặt đơn</div>
          <div className={css.columnDescription}>
            Đơn sẽ được tự động đặt vào lúc{' '}
            <b>{formattedAutomaticConfirmOrder}</b>. Trường hợp nếu đến hạn mà
            không đủ số lượng đặt món thì đơn sẽ bị hủy.
          </div>
        </div>
      </div>
      <div className={css.column}>
        <svg
          width="37"
          height="36"
          viewBox="0 0 37 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect width="37" height="36" rx="18" fill="#65DB63" />
          <path
            d="M18.5 15.5V19.5L21 21M18.5 11C13.8056 11 10 14.8056 10 19.5C10 24.1944 13.8056 28 18.5 28C23.1944 28 27 24.1944 27 19.5C27 14.8056 23.1944 11 18.5 11ZM18.5 11V8M16.5 8H20.5M26.829 11.592L25.329 10.092L26.079 10.842M10.171 11.592L11.671 10.092L10.921 10.842"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <div>
          <div className={css.columnTitle}>
            Tự động hủy tham gia cho thành viên
          </div>
          <div className={css.columnDescription}>
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
