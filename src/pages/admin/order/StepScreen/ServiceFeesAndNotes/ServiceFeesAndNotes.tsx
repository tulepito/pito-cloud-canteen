import { useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../../create/components/NavigateButtons/NavigateButtons';
import ServiceFeeAndNoteForm from '../../create/components/ServiceFeeAndNoteForm/ServiceFeeAndNoteForm';

import css from './ServiceFeesAndNotes.module.scss';

const INITIAL_NOTE = `- Đối tác vui lòng giao đúng giờ, vận chuyển và đựng thực phẩm đúng tiêu chuẩn, chuyên nghiệp và kín đáo.
- Chuẩn bị đầy đủ công cụ dụng cụ và định lượng phần ăn.
- Không để thực phẩm dưới đất.
- Thực hiện lưu mẫu theo quy định của Bộ VSATTP.
- Lưu ý các thông tin chi tiết trong đơn hàng.`;

type ServiceFeesAndNotesProps = {
  goBack: () => void;
  nextTab: () => void;
};

const ServiceFeesAndNotes: React.FC<ServiceFeesAndNotesProps> = (props) => {
  const { goBack, nextTab } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const formSubmitRef = useRef<any>();

  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const orderListing = Listing(order);
  const { notes } = orderListing.getMetadata();
  const restaurantList = useAppSelector(
    (state) => state.Order.orderRestaurantList,
    shallowEqual,
  );
  const fetchOrderRestaurantListInProgress = useAppSelector(
    (state) => state.Order.fetchOrderRestaurantListInProgress,
  );
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );

  const restaurantOptions = restaurantList.map((restaurant: TListing) => (
    <option
      key={Listing(restaurant).getId()}
      value={Listing(restaurant).getId()}>
      {`${Listing(restaurant).getAttributes().title}`}
    </option>
  ));

  const serviceFees = useMemo(
    () =>
      restaurantList.map((restaurant: TListing) => (
        <div className={css.feeRow} key={Listing(restaurant).getId()}>
          <div className={css.feeLabel}>
            {Listing(restaurant).getAttributes()?.title}
          </div>
          <div className={classNames(css.price, css.percentage)}>
            {addCommas(Listing(restaurant).getMetadata()?.serviceFee || 0)}
          </div>
        </div>
      )),
    [restaurantList],
  );

  useEffect(() => {
    dispatch(orderAsyncActions.fetchOrderRestaurants());
  }, [dispatch]);

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

  const onSubmit = async () => {
    await formSubmitRef?.current();
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
                    {addCommas('200000')}
                  </div>
                </div>
              </div>
              <div className={css.serviceFee}>
                <h3>
                  {intl.formatMessage({ id: 'ServiceFeesAndNotes.serviceFee' })}
                </h3>
                {serviceFees}
              </div>
            </div>
          </div>
          <div>
            <NavigateButtons
              goBack={goBack}
              onNextClick={onSubmit}
              inProgress={updateOrderInProgress}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceFeesAndNotes;
