import RestaurantRow from './RestaurantRow';
import RestaurantTableHead from './RestaurantTableHead';
import SelectRestaurantForm from './SelectRestaurantForm';

type TRestaurantTableProps = {
  restaurants: any;
  onItemClick: (id: string) => () => void;
};

const RestaurantTable: React.FC<TRestaurantTableProps> = ({
  restaurants,
  onItemClick,
}) => {
  const items =
    restaurants?.length > 0
      ? restaurants.map((restaurant: any, index: any) => {
          const restaurantId = restaurant?.id?.uuid;

          return (
            <RestaurantRow
              key={index}
              restaurant={restaurant}
              onItemClick={onItemClick(restaurantId)}
            />
          );
        })
      : null;

  return (
    <>
      <RestaurantTableHead />
      <SelectRestaurantForm onSubmit={() => {}} items={items} />
    </>
  );
};

export default RestaurantTable;
