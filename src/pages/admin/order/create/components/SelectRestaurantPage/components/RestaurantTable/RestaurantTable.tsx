import type { FormState } from 'final-form';

import FieldRestaurant from './FieldRestaurant';
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
  return (
    <>
      <RestaurantTableHead />
      <SelectRestaurantForm
        onSubmit={() => {}}
        currentRestaurant={currentRestaurant}
        isSelectedRestaurant={isSelectedRestaurant}
        onFormChange={onFormChange}>
        <>
          {restaurants?.length > 0
            ? restaurants.map((restaurant: any, index: any) => (
                <FieldRestaurant
                  key={index}
                  restaurant={restaurant}
                  onItemClick={onItemClick(restaurant)}
                />
              ))
            : null}
        </>
      </SelectRestaurantForm>
    </>
  );
};

export default RestaurantTable;
