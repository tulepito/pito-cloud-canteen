import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { DateTime } from 'luxon';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import MobileTopContainer from '@components/MobileTopContainer/MobileTopContainer';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Stepper from '@components/Stepper/Stepper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { BOOKER_CREATE_GROUP_ORDER_STEPS } from '@src/constants/stepperSteps';
import { Listing } from '@src/utils/data';

import type { DeadlineDateTimeFormValues } from './DeadlineDateTimeForm';
import DeadlineDateTimeForm from './DeadlineDateTimeForm';
import ParticipantManagement from './ParticipantManagement';

import css from './ParticipantInvitation.module.scss';

type TParticipantInvitationProps = {
  onGoBack: () => void;
  onPublishOrder: () => void;
};

const ParticipantInvitation: React.FC<TParticipantInvitationProps> = ({
  onGoBack,
  onPublishOrder,
}) => {
  const confirmPublishOrderControl = useBoolean();
  const dispatch = useAppDispatch();
  const { isMobileLayout } = useViewport();
  const order = useAppSelector((state) => state.Order.order);
  const participantData = useAppSelector(
    (state) => state.BookerDraftOrderPage.participantData,
  );

  const { startDate, deadlineDate, deadlineHour } =
    Listing(order).getMetadata();

  // * calculate start delivery time
  const nextStartWeek = DateTime.fromJSDate(new Date())
    .startOf('week')
    .startOf('day')
    .plus({ days: 7 })
    .toMillis();
  const deliveryTime = new Date(startDate || nextStartWeek);

  // * prepare deadline date time form initial
  const defaultDeadlineDate = DateTime.fromMillis(startDate || nextStartWeek)
    .minus({ days: 2 })
    .toMillis();
  const deadlineDateTimeInitialValues = {
    deadlineDate: new Date(deadlineDate).getTime() || defaultDeadlineDate,
    deadlineHour,
    draftDeadlineHour: deadlineHour,
  };

  // * condition to disable publish order
  const isParticipantListEmpty = isEmpty(participantData);
  const shouldDisabledSubmitPublishOrder = isParticipantListEmpty;

  // * submit change deadline date & time
  const handleSubmitDeadlineDateTimeForm = async (
    values: DeadlineDateTimeFormValues,
  ) => {
    if (!isEqual(deadlineDateTimeInitialValues, values)) {
      await dispatch(
        orderAsyncActions.updateOrder({
          generalInfo: values,
        }),
      );
    }
    confirmPublishOrderControl.setTrue();
  };

  // * confirm publish draft order
  const handleConfirmPublishOrder = () => {
    confirmPublishOrderControl.setFalse();

    onPublishOrder();
  };

  const deadlineFormComponent = (
    <DeadlineDateTimeForm
      deliveryTime={deliveryTime}
      initialValues={deadlineDateTimeInitialValues}
      onSubmit={handleSubmitDeadlineDateTimeForm}
      shouldDisableSubmit={shouldDisabledSubmitPublishOrder}
    />
  );

  return (
    <>
      <MobileTopContainer
        title="Mời tham gia nhóm"
        hasGoBackButton
        onGoBack={onGoBack}
      />
      <Stepper steps={BOOKER_CREATE_GROUP_ORDER_STEPS} currentStep={2} />
      <div className={css.root}>
        <div className={css.contentContainer}>
          <div className={css.titleContainer}>
            <Button
              variant="inline"
              className={css.goBackButtonContainer}
              onClick={onGoBack}>
              <IconArrow direction="left" />
              <span className={css.goBackText}>Quay lại</span>
            </Button>
            <div className={css.title}>
              <div>Mời thành viên tham gia nhóm</div>
              <Badge label="Các thành viên được mời sẽ nhận thông báo chọn món ngay sau khi gửi lời mời" />
            </div>
          </div>
          <div className={css.participantInvitationContainer}>
            <MobileBottomContainer className={css.mobileDeadlineFormContainer}>
              {deadlineFormComponent}
            </MobileBottomContainer>
            <RenderWhen condition={!isMobileLayout}>
              {deadlineFormComponent}
            </RenderWhen>
            <AlertModal
              childrenClassName={css.confirmModalChildrenContainer}
              isOpen={confirmPublishOrderControl.value}
              handleClose={confirmPublishOrderControl.setFalse}
              title="Xác nhận đơn và gửi lời mời"
              cancelLabel="Đóng"
              confirmLabel={'Gửi lời mời'}
              confirmDisabled={shouldDisabledSubmitPublishOrder}
              onCancel={onGoBack}
              onConfirm={handleConfirmPublishOrder}>
              Sau khi gửi, bạn sẽ không thể chỉnh sửa thực đơn của tuần ăn.
            </AlertModal>
            <ParticipantManagement />
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantInvitation;
