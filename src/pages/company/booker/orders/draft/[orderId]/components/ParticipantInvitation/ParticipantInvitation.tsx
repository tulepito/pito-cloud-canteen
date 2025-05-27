import { useIntl } from 'react-intl';
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
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import Tracker from '@helpers/tracker';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { useBookerCreateGroupOrderStepsLabel } from '@src/constants/stepperSteps';
import { Listing } from '@src/utils/data';

import type { TDeadlineDateTimeFormValues } from './DeadlineDateTimeForm';
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

  const { startDate, deadlineHour, deliveryHour } =
    Listing(order).getMetadata();
  const intl = useIntl();

  // * calculate start delivery time
  const nextStartWeek = DateTime.fromJSDate(new Date())
    .startOf('week')
    .startOf('day')
    .plus({ days: 7 })
    .toMillis();
  const deliveryTime = new Date(startDate || nextStartWeek);

  // * prepare deadline date time form initial
  const deadlineDateTimeInitialValues = {
    deadlineDate: undefined,
    deadlineHour: undefined,
    draftDeadlineHour: deadlineHour,
  };

  // * condition to disable publish order
  const isParticipantListEmpty = isEmpty(participantData);
  const shouldDisabledSubmitPublishOrder = isParticipantListEmpty;

  const handleUpdateOrderInfo = async (values: TDeadlineDateTimeFormValues) => {
    if (!isEqual(deadlineDateTimeInitialValues, values)) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { deadlineDate, deadlineHour } = values;
      await dispatch(
        orderAsyncActions.updateOrder({
          generalInfo: {
            deadlineDate: DateTime.fromMillis(Number(deadlineDate))
              .startOf('day')
              .plus({
                ...convertHHmmStringToTimeParts(deadlineHour),
              })
              .toMillis(),
            deadlineHour,
          },
        }),
      );
    }
  };

  const handleSubmitDeadlineDateTimeForm = async (
    values: TDeadlineDateTimeFormValues,
  ) => {
    if (!isMobileLayout) {
      handleUpdateOrderInfo(values);
    }
    confirmPublishOrderControl.setTrue();
  };

  const handleConfirmPublishOrder = () => {
    confirmPublishOrderControl.setFalse();
    Tracker.track('booker:order:send-invitation-emails', {
      orderId: order?.id?.uuid,
    });

    onPublishOrder();
  };

  const deadlineFormComponent = (
    <DeadlineDateTimeForm
      deliveryTime={deliveryTime}
      deliveryHour={deliveryHour}
      initialValues={deadlineDateTimeInitialValues}
      onSubmit={handleSubmitDeadlineDateTimeForm}
      shouldDisableSubmit={shouldDisabledSubmitPublishOrder}
      onUpdateOrderInfo={handleUpdateOrderInfo}
    />
  );

  const BOOKER_CREATE_GROUP_ORDER_STEPS = useBookerCreateGroupOrderStepsLabel();

  return (
    <>
      <MobileTopContainer
        title={intl.formatMessage({ id: 'moi-tham-gia-nhom' })}
        hasGoBackButton
        onGoBack={onGoBack}
      />
      <Stepper
        className={css.stepperContainerMobile}
        steps={BOOKER_CREATE_GROUP_ORDER_STEPS}
        currentStep={2}
      />

      <div className={css.root}>
        <div className={css.contentContainer}>
          <div className={css.titleContainer}>
            <Button
              variant="inline"
              className={css.goBackButtonContainer}
              onClick={onGoBack}>
              <IconArrow direction="left" />
              <span className={css.goBackText}>
                {intl.formatMessage({
                  id: 'booker.orders.draft.foodDetailModal.back',
                })}
              </span>
            </Button>
            <div className={css.title}>
              <div>
                {intl.formatMessage({ id: 'moi-thanh-vien-tham-gia-nhom' })}
              </div>
              <Badge
                label={intl.formatMessage({
                  id: 'cac-thanh-vien-duoc-moi-se-nhan-thong-bao-chon-mon-ngay-sau-khi-gui-loi-moi',
                })}
              />
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
              containerClassName={css.confirmModalContainer}
              isOpen={confirmPublishOrderControl.value}
              handleClose={confirmPublishOrderControl.setFalse}
              title={intl.formatMessage({ id: 'xac-nhan-don-va-gui-loi-moi' })}
              cancelLabel={intl.formatMessage({ id: 'dong' })}
              confirmLabel={intl.formatMessage({ id: 'gui-loi-moi' })}
              shouldFullScreenInMobile={false}
              confirmDisabled={shouldDisabledSubmitPublishOrder}
              onCancel={onGoBack}
              onConfirm={handleConfirmPublishOrder}>
              {intl.formatMessage({
                id: 'sau-khi-gui-ban-se-khong-the-chinh-sua-thuc-don-cua-tuan-an',
              })}
            </AlertModal>
            <ParticipantManagement />
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantInvitation;
