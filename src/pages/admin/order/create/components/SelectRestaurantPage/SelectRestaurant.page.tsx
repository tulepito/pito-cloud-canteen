import Badge from '@components/Badge/Badge';
import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Pagination from '@components/Pagination/Pagination';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { selectRestaurantPageThunks } from '@redux/slices/SelectRestaurantPage.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';
import { DateTime } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// eslint-disable-next-line import/no-cycle
import type { TSelectFoodFormValues } from '../SelectFoodModal/components/SelectFoodForm/SelectFoodForm';
import SelectFoodModal from '../SelectFoodModal/SelectFoodModal';
import RestaurantTable from './components/RestaurantTable/RestaurantTable';
import SearchRestaurantForm from './components/SearchRestaurantForm/SearchRestaurantForm';
import css from './SelectRestaurantPage.module.scss';

const DEBOUNCE_TIME = 500;

type TSelectRestaurantPageProps = {
  onSubmitRestaurant: (values: Record<string, any>) => void;
  selectedDate: Date;
  onBack: () => void;
};

const SelectRestaurantPage: React.FC<TSelectRestaurantPageProps> = ({
  onSubmitRestaurant,
  selectedDate,
  onBack,
}) => {
  const [currentRestaurant, setCurrentRestaurant] = useState<any>();
  const intl = useIntl();
  const { value: isModalOpen, setValue: setModalOpen } = useBoolean();
  const dispatch = useAppDispatch();
  const {
    Order: { order },
    SelectRestaurantPage: {
      restaurants,
      pagination,
      foodList,
      fetchFoodPending,
      fetchRestaurantsPending,
    },
  } = useAppSelector((state) => state);
  const { deliveryHour, deliveryAddress } = Listing(
    order as TListing,
  ).getMetadata();
  const shouldShowRestaurantPagination =
    !!restaurants && restaurants?.length > 0 && fetchRestaurantsPending;
  const {
    totalItems: total,
    page: current,
    perPage: pageSize = 100,
  } = pagination || {};
  const paginationProps = { total, current, pageSize };
  const showModalCondition = isModalOpen && !fetchFoodPending;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  let currDebounceRef = debounceRef.current;

  const dateTime = DateTime.fromJSDate(selectedDate);
  const formattedDate = dateTime.toFormat('dd/MM/yyyy - EEE', { locale: 'vi' });
  const labelForBadge = intl.formatMessage(
    { id: 'SelectRestaurantPage.subtitle' },
    {
      date: formattedDate,
      hour: deliveryHour,
      address: deliveryAddress?.address,
    },
  );

  const handlePageChange = (page: number) => {
    const params = {
      page,
    };
    dispatch(selectRestaurantPageThunks.getRestaurants(params));
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentRestaurant(undefined);
  };

  const handleSearchRestaurant = (title: string) => {
    if (currDebounceRef) {
      clearTimeout(currDebounceRef);
    }

    currDebounceRef = setTimeout(() => {
      dispatch(selectRestaurantPageThunks.getRestaurants({ dateTime, title }));
    }, DEBOUNCE_TIME);
  };

  const handleSelectFood = (values: TSelectFoodFormValues) => {
    const { food: foodIds } = values;

    const currRestaurantId = currentRestaurant?.id?.uuid;

    const submitFoodListData = foodIds
      .map((foodId) => {
        const item = foodList.find((food) => food?.id?.uuid === foodId);
        const { id, attributes } = item || {};
        const { title, price } = attributes;

        return { id: id?.uuid, foodName: title, foodPrice: price?.amount || 0 };
      })
      .reduce((result, curr) => {
        const { id, foodName, foodPrice } = curr;

        return { ...result, [id]: { foodName, foodPrice } };
      }, {});

    const submitRestaurantData = {
      id: currRestaurantId,
      restaurantName: currentRestaurant?.attributes?.title,
      phoneNumber: currentRestaurant?.attributes?.publicData?.phoneNumber,
    };

    onSubmitRestaurant({
      restaurant: submitRestaurantData,
      selectedFoodList: submitFoodListData,
    });
    setModalOpen(false);
  };

  const handleRestaurantClick = (restaurant: any) => () => {
    const { restaurantInfo, menu } = restaurant;

    dispatch(
      selectRestaurantPageThunks.getRestaurantFood({
        dateTime,
        menuId: Listing(menu).getId(),
      }),
    );
    setCurrentRestaurant(restaurantInfo);
    setModalOpen(true);
  };

  useEffect(() => {
    dispatch(selectRestaurantPageThunks.getRestaurants({ dateTime }));
  }, [dispatch]);

  return (
    <section className={css.root}>
      <div className={css.goBackContainer} onClick={onBack}>
        <IconArrowHead direction="left" />
        <span className={css.goBack}></span>
        <FormattedMessage id="SelectRestaurantPage.goBack" />
      </div>
      <div className={css.titleContainer}>
        <h1>
          <FormattedMessage id="SelectRestaurantPage.title" />
        </h1>
        <Badge label={labelForBadge} />
      </div>
      <SearchRestaurantForm
        onSubmit={() => {}}
        onSearchRestaurant={handleSearchRestaurant}
      />
      <RestaurantTable
        restaurants={restaurants}
        onItemClick={handleRestaurantClick}
      />
      {shouldShowRestaurantPagination && (
        <div className={css.paginationContainer}>
          <Pagination {...paginationProps} onChange={handlePageChange} />
        </div>
      )}
      <SelectFoodModal
        restaurant={currentRestaurant}
        items={foodList}
        isOpen={showModalCondition}
        handleClose={handleCloseModal}
        handleSelectFood={handleSelectFood}
      />
    </section>
  );
};

export default SelectRestaurantPage;
