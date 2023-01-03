import { useAppSelector } from '@hooks/reduxHooks';
import type { FormState } from 'final-form';

import FieldRestaurant from './FieldRestaurant';
import css from './RestaurantTable.module.scss';
import RestaurantTableHead from './RestaurantTableHead';
import type { TSelectRestaurantFormValues } from './SelectRestaurantForm';
import SelectRestaurantForm from './SelectRestaurantForm';

type TRestaurantTableProps = {
  restaurants: any;
  currentRestaurant: any;
  isSelectedRestaurant: boolean;
  onItemClick: (id: string) => () => void;
  onFormChange: (
    form: FormState<
      TSelectRestaurantFormValues,
      Partial<TSelectRestaurantFormValues>
    >,
  ) => void;
};

const RestaurantTable: React.FC<TRestaurantTableProps> = ({
  restaurants,
  onItemClick,
  isSelectedRestaurant,
  currentRestaurant,
  onFormChange,
}) => {
  const { fetchRestaurantsPending } = useAppSelector(
    (state) => state.SelectRestaurantPage,
  );

  return (
    <>
      <RestaurantTableHead />
      <SelectRestaurantForm
        onSubmit={() => {}}
        currentRestaurant={currentRestaurant}
        isSelectedRestaurant={isSelectedRestaurant}
        onFormChange={onFormChange}>
        <>
          {fetchRestaurantsPending ? (
            <div className={css.center}>... Loading</div>
          ) : (
            <>
              {restaurants?.length > 0 ? (
                restaurants.map((restaurant: any, index: any) => (
                  <FieldRestaurant
                    key={index}
                    restaurant={restaurant}
                    onItemClick={onItemClick(restaurant)}
                  />
                ))
              ) : (
                <div className={css.center}>Không có nhà hàng nào</div>
              )}
            </>
          )}
        </>
      </SelectRestaurantForm>
    </>
  );
};

export default RestaurantTable;
