import Badge from '@components/Badge/Badge';
import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Pagination from '@components/Pagination/Pagination';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { selectRestaurantPageThunks } from '@redux/slices/SelectRestaurantPage.slice';
import { weekDayFormatFromDateTime } from '@utils/dates';
import type { FormState } from 'final-form';
import { DateTime } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

// eslint-disable-next-line import/no-cycle
import type { TSelectFoodFormValues } from '../SelectFoodModal/components/SelectFoodForm/SelectFoodForm';
import SelectFoodModal from '../SelectFoodModal/SelectFoodModal';
import RestaurantTable from './components/RestaurantTable/RestaurantTable';
import type { TSelectRestaurantFormValues } from './components/RestaurantTable/SelectRestaurantForm';
import SearchRestaurantForm from './components/SearchRestaurantForm/SearchRestaurantForm';
import css from './SelectRestaurantPage.module.scss';

const DEBOUNCE_TIME = 300;

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
  const [mounted, setMounted] = useState<boolean>();
  const [currentRestaurant, setCurrentRestaurant] = useState<any>();
  const [isSelectedRestaurant, setIsSelectedRestaurant] = useState(false);
  const [currentFoodList, setCurrentFoodList] = useState<string[]>([]);
  const { value: isModalOpen, setValue: setModalOpen } = useBoolean();
  const dispatch = useAppDispatch();
  const {
    restaurants,
    pagination,
    foodOfRestaurant,
    foodList,
    fetchFoodPending,
  } = useAppSelector((state) => state.SelectRestaurantPage);
  const {
    draftOrder: { deliveryAddress, deliveryHour },
  } = useAppSelector((state) => state.Order);

  const {
    totalItems: total,
    page: current,
    perPage: pageSize = 100,
  } = pagination || {};
  const paginationProps = { total, current, pageSize };
  const showModalCondition =
    isModalOpen && !fetchFoodPending && !!currentRestaurant;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  let currDebounceRef = debounceRef.current;

  const dateTime = DateTime.fromJSDate(selectedDate);
  const formattedDate = dateTime.toFormat('dd/MM/yyyy');
  const labelForBadge = `Cho ngày ${formattedDate} - ${weekDayFormatFromDateTime(
    dateTime,
  )} (${deliveryHour})- tại ${deliveryAddress?.address}`;

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
      dispatch(selectRestaurantPageThunks.getRestaurants({ title }));
    }, DEBOUNCE_TIME);
  };

  const handleSelectFood = (values: TSelectFoodFormValues) => {
    const { food: foodIds } = values;

    setCurrentFoodList(foodIds);
    setIsSelectedRestaurant(true);
    setModalOpen(false);
  };

  const handleRestaurantClick = (restaurant: any) => () => {
    const restaurantId = restaurant?.id?.uuid;

    dispatch(selectRestaurantPageThunks.getRestaurantFood(restaurantId));
    setCurrentRestaurant(restaurant);
    setModalOpen(true);
  };

  const handleConfirmSelectRestaurant = () => {
    if (!currentRestaurant) return;
    const currRestaurantId = currentRestaurant?.id?.uuid;

    if (currentFoodList.length === 0 || currRestaurantId !== foodOfRestaurant) {
      handleRestaurantClick(currentRestaurant)();
      return;
    }

    const submitFoodListData = currentFoodList
      .map((foodId) => {
        const item = foodList.find((food) => food?.id?.uuid === foodId);
        const { id, attributes } = item || {};
        const { title, price } = attributes;

        return { id: id?.uuid, foodName: title, foodPrice: price || 0 };
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
  };

  const handleFormChange = (
    form: FormState<
      TSelectRestaurantFormValues,
      Partial<TSelectRestaurantFormValues>
    >,
  ) => {
    if (!mounted) {
      return;
    }

    const {
      values: { restaurant: restaurantId },
    } = form;

    if (restaurantId) {
      const res = restaurants?.find((r) => r?.id?.uuid === restaurantId);

      setCurrentRestaurant(res);
      setIsSelectedRestaurant(true);
    }
  };

  useEffect(() => {
    dispatch(selectRestaurantPageThunks.getRestaurants());
  }, [dispatch]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        onSelectRestaurant={handleConfirmSelectRestaurant}
        selectRestaurantDisable={!isSelectedRestaurant}
      />
      <RestaurantTable
        restaurants={restaurants}
        onItemClick={handleRestaurantClick}
        isSelectedRestaurant={isSelectedRestaurant}
        currentRestaurant={currentRestaurant}
        onFormChange={handleFormChange}
      />
      {!!restaurants && restaurants?.length > 0 && (
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
