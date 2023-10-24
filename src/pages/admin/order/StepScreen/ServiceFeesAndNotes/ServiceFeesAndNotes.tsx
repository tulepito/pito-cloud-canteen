/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import { addCommas } from '@helpers/format';
import { getPCCFeeByMemberAmount } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing, User } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

// eslint-disable-next-line import/no-cycle
import NavigateButtons, {
  EFlowType,
} from '../../components/NavigateButtons/NavigateButtons';
import PartnerFeeForm from '../../components/PartnerFeeForm/PartnerFeeForm';
import ServiceFeeAndNoteForm from '../../components/ServiceFeeAndNoteForm/ServiceFeeAndNoteForm';

import css from './ServiceFeesAndNotes.module.scss';

const INITIAL_NOTE = `- Đối tác vui lòng giao đúng giờ, vận chuyển và đựng thực phẩm đúng tiêu chuẩn, chuyên nghiệp và kín đáo.
- Chuẩn bị đầy đủ công cụ dụng cụ và định lượng phần ăn.
- Không để thực phẩm dưới đất.
- Thực hiện lưu mẫu theo quy định của Bộ VSATTP.
- Lưu ý các thông tin chi tiết trong đơn hàng.`;

type ServiceFeesAndNotesProps = {
  goBack: () => void;
  nextTab: () => void;
  nextToReviewTab?: () => void;
  flowType?: EFlowType;
};

const ServiceFeesAndNotes: React.FC<ServiceFeesAndNotesProps> = (props) => {
  const {
    goBack,
    nextTab,
    nextToReviewTab,
    flowType = EFlowType.createOrEditDraft,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const formSubmitRef = useRef<any>();
  const partnerFormSubmitRef = useRef<any>();
  const [partnerFormDisabled, setPartnerFormDisabled] = useState(false);

  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const orderListing = Listing(order);

  const restaurantList = useAppSelector(
    (state) => state.Order.orderRestaurantList,
    shallowEqual,
  );

  const systemServiceFeePercentage = useAppSelector(
    (state) => state.SystemAttributes.systemServiceFeePercentage,
    shallowEqual,
  );
  const fetchOrderRestaurantListInProgress = useAppSelector(
    (state) => state.Order.fetchOrderRestaurantListInProgress,
  );
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
  const { notes, serviceFees, memberAmount = 0 } = orderListing.getMetadata();
  const { companyId: clientId } = Listing(order as TListing).getMetadata();

  const companies = useAppSelector(
    (state) => state.company.companyRefs,
    shallowEqual,
  );
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );

  const isEditFlow = flowType === EFlowType.edit;

  const { hasSpecificPCCFee = false, specificPCCFee = 0 } =
    User(currentClient).getMetadata();

  const numberOfOrderDays = Object.keys(orderDetail).length;
  const PITOFee =
    (hasSpecificPCCFee
      ? specificPCCFee
      : getPCCFeeByMemberAmount(memberAmount)) * numberOfOrderDays;
  const restaurantOptions = restaurantList.map((restaurant: TListing) => ({
    label: Listing(restaurant).getAttributes().title,
    key: Listing(restaurant).getId(),
  }));

  const partnerFormInitialValues = useMemo(() => {
    return restaurantList.reduce((result: any, restaurant: TListing | null) => {
      const restaurantListing = Listing(restaurant);

      return {
        ...result,
        [`partnerFee-${restaurantListing.getId()}`]:
          systemServiceFeePercentage * 100 ||
          serviceFees?.[restaurantListing.getId()] ||
          0,
      };
    }, {});
  }, [
    JSON.stringify(restaurantList),
    JSON.stringify(serviceFees),
    systemServiceFeePercentage,
  ]);

  useEffect(() => {
    dispatch(orderAsyncActions.fetchOrderRestaurants());
  }, []);

  const handleFormSubmit = async (values: any) => {
    const newNotes = Object.keys(values).reduce((result, note) => {
      if (note.startsWith('note-')) {
        return {
          ...result,
          [note.replace('note-', '')]: values[note],
        };
      }

      return result;
    }, {});
    await dispatch(
      orderAsyncActions.updateOrder({
        generalInfo: {
          notes: newNotes,
        },
      }),
    );
  };

  const handlePartnerFeeFormSubmit = async (values: any) => {
    const newPartnerFees = Object.keys(values).reduce((result, fee) => {
      if (fee.startsWith('partnerFee-')) {
        return {
          ...result,
          [fee.replace('partnerFee-', '')]: +values[fee],
        };
      }

      return result;
    }, {});
    await dispatch(
      orderAsyncActions.updateOrder({
        generalInfo: {
          serviceFees: newPartnerFees,
        },
      }),
    );
  };

  const onSubmit = async () => {
    if (!isEditFlow) {
      await formSubmitRef?.current();
      await partnerFormSubmitRef?.current();
    }
    nextTab();
  };

  const noteInitialValues = useMemo(
    () =>
      restaurantList.reduce((result, restaurant) => {
        return {
          ...result,
          [`note-${Listing(restaurant).getId()}`]:
            notes?.[Listing(restaurant).getId()] || INITIAL_NOTE,
        };
      }, {}),
    [notes, restaurantList],
  );
  const initialValues = useMemo(
    () => ({
      restaurant: restaurantList?.[0]?.id?.uuid,
      ...noteInitialValues,
    }),
    [noteInitialValues, restaurantList],
  );

  return (
    <div className={css.container}>
      {fetchOrderRestaurantListInProgress ? (
        <div className={css.loading}>
          {intl.formatMessage({ id: 'ServiceFeesAndNotes.loading' })}
        </div>
      ) : (
        <>
          <div className={css.mainLayout}>
            <div className={css.leftCol}>
              <ServiceFeeAndNoteForm
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                restaurantOptions={restaurantOptions}
                formSubmitRef={formSubmitRef}
              />
            </div>
            <div className={css.rightCol}>
              <div className={css.pccFee}>
                <h3>
                  {intl.formatMessage({ id: 'ServiceFeesAndNotes.PITOFee' })}
                </h3>
                <div className={css.feeRow}>
                  <div className={css.feeLabel}>PITO</div>
                  <div className={classNames(css.price, css.vnd)}>
                    {addCommas(PITOFee.toString())}
                  </div>
                </div>
              </div>
              <div className={css.serviceFee}>
                <h3>
                  {intl.formatMessage({ id: 'ServiceFeesAndNotes.serviceFee' })}
                </h3>
                <PartnerFeeForm
                  onSubmit={handlePartnerFeeFormSubmit}
                  initialValues={partnerFormInitialValues}
                  restaurantList={restaurantList}
                  formSubmitRef={partnerFormSubmitRef}
                  setPartnerFormDisabled={setPartnerFormDisabled}
                />
              </div>
            </div>
          </div>
          <div>
            <NavigateButtons
              goBack={goBack}
              onNextClick={onSubmit}
              onCompleteClick={nextToReviewTab}
              flowType={flowType}
              submitDisabled={partnerFormDisabled}
              inProgress={updateOrderInProgress}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceFeesAndNotes;
